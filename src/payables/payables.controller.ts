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
import { CreatePayableDto } from './dto/create-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';
import { FindAllPayablesDto } from './dto/find-all-payables.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { Payable } from './model/payable.model';
import { PayablesService } from './payables.service';

@ApiTags('payables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payables')
export class PayablesController {
  constructor(
    private readonly payablesService: PayablesService,

    @Inject(AZURE_BLOB_SERVICE)
    private readonly azureBlob: AzureBlobService,
  ) {}

  @Get()
  @RequirePermission(PERMISSIONS.PAYABLES.VIEW)
  @ApiOperation({ summary: 'List payables' })
  @ApiResponse({ type: PaginatedResponse(Payable) })
  findAll(@Query() query: FindAllPayablesDto) {
    return this.payablesService.findAll(query);
  }

  @Get('stats')
  @RequirePermission(PERMISSIONS.PAYABLES.VIEW)
  @ApiOperation({ summary: 'Get payable stats (total amount and amount paid)' })
  getStats(@Query() query: FindAllPayablesDto) {
    return this.payablesService.getStats(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.PAYABLES.VIEW)
  @ApiOperation({ summary: 'Get payable' })
  @ApiResponse({ type: Payable })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.PAYABLES.CREATE)
  @ApiOperation({ summary: 'Create payable' })
  @ApiResponse({ type: Payable })
  create(@Body() dto: CreatePayableDto) {
    return this.payablesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Update payable' })
  @ApiResponse({ type: Payable })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayableDto) {
    return this.payablesService.update(id, dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.PAYABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete payables' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.payablesService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.PAYABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payable' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.remove(id);
  }

  @Patch(':id/payments')
  @RequirePermission(PERMISSIONS.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Register installment payment' })
  createPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePayablePaymentDto,
  ) {
    return this.payablesService.createPayment(id, dto);
  }

  @Delete(':id/payments/:paymentId')
  @RequirePermission(PERMISSIONS.PAYABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reverse payable payment' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  deletePayment(
    @Param('id', ParseIntPipe) _id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.payablesService.deletePayment(paymentId);
  }

  @Post(':id/payments/:paymentId/invoice')
  @RequirePermission(PERMISSIONS.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Attach invoice to payment' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentInvoice(
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
    const payment = await this.payablesService.getPayment(paymentId);

    if (payment.file) {
      await this.azureBlob.delete(payment.file.blob_path);
    }

    const blobPath = this.azureBlob.buildBlobPath(
      'invoices/payable-payments',
      paymentId,
      file.originalname,
    );

    const url = await this.azureBlob.upload(
      blobPath,
      file.buffer,
      file.mimetype,
    );

    return this.payablesService.addPaymentInvoice(paymentId, {
      url,
      blob_path: blobPath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
    });
  }

  @Delete(':id/payments/:paymentId/invoice')
  @RequirePermission(PERMISSIONS.PAYABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove invoice from payment' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deletePaymentInvoice(
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    const payment = await this.payablesService.getPayment(paymentId);

    if (payment.file) {
      await this.azureBlob.delete(payment.file.blob_path);
    }

    await this.payablesService.deletePaymentInvoice(paymentId);
  }
}
