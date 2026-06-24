import { AZURE_BLOB_SERVICE } from '@common/providers/azure-blob/azure-blob.service.interface';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PERMISSIONS } from '../common/constants/permissions';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { BulkDeleteDto } from '../common/dto/bulk-delete.dto';
import { AzureBlobService } from '../common/providers/azure-blob/azure-blob.service';
import { PaginatedResponse } from '../common/swagger/paginated-response';
import { CreateReceivablePaymentDto } from './dto/create-payment.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { FindAllReceivablesDto } from './dto/find-all-receivables.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { Receivable } from './model/receivable.model';
import { ReceivablesService } from './receivables.service';

@ApiTags('receivables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('receivables')
export class ReceivablesController {
  constructor(
    private readonly receivablesService: ReceivablesService,

    @Inject(AZURE_BLOB_SERVICE)
    private readonly azureBlob: AzureBlobService,
  ) {}

  @Get()
  @RequirePermission(PERMISSIONS.RECEIVABLES.VIEW)
  @ApiOperation({ summary: 'List receivables' })
  @ApiResponse({ type: PaginatedResponse(Receivable) })
  findAll(@Query() query: FindAllReceivablesDto) {
    return this.receivablesService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.RECEIVABLES.VIEW)
  @ApiOperation({ summary: 'Get receivable' })
  @ApiResponse({ type: Receivable })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.RECEIVABLES.CREATE)
  @ApiOperation({ summary: 'Create receivable' })
  @ApiResponse({ type: Receivable })
  create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Update receivable' })
  @ApiResponse({ type: Receivable })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReceivableDto,
  ) {
    return this.receivablesService.update(id, dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.RECEIVABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete receivables' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.receivablesService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.RECEIVABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete receivable' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.delete(id);
  }

  @Post(':id/payments')
  @RequirePermission(PERMISSIONS.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Create receivable payment' })
  createPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReceivablePaymentDto,
  ) {
    return this.receivablesService.createPayment(id, dto);
  }

  @Delete(':id/payments/:paymentId')
  @RequirePermission(PERMISSIONS.RECEIVABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reverse receivable payment' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  deletePayment(
    @Param('id', ParseIntPipe) _id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.receivablesService.deletePayment(paymentId);
  }

  @Post(':id/payments/:paymentId/invoice')
  @RequirePermission(PERMISSIONS.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Attach invoice to payment' })
  @UseInterceptors(FileInterceptor('file'))
  async attachPaymentInvoice(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(pdf|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const payment = await this.receivablesService.getPayment(paymentId);

    if (payment.file) {
      await this.azureBlob.delete(payment.file.blob_path);
    }

    const blobPath = this.azureBlob.buildBlobPath(
      'invoices/receivable-payments',
      paymentId,
      file.originalname,
    );

    const url = await this.azureBlob.upload(
      blobPath,
      file.buffer,
      file.mimetype,
    );

    return this.receivablesService.attachPaymentInvoice(paymentId, {
      url,
      blob_path: blobPath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
    });
  }

  @Delete(':id/payments/:paymentId/invoice')
  @RequirePermission(PERMISSIONS.RECEIVABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove invoice from payment' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async removePaymentInvoice(
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    const payment = await this.receivablesService.getPayment(paymentId);

    if (payment.file) {
      await this.azureBlob.delete(payment.file.blob_path);
    }

    await this.receivablesService.removePaymentInvoice(paymentId);
  }
}
