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

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AzureBlobService } from '../common/providers/azure-blob/azure-blob.service';
import { BulkDeleteDto } from '../common/dto/bulk-delete.dto';
import { PaginatedResponse } from '../common/swagger/paginated-response';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { FindAllBillsDto } from './dto/find-all-bills.dto';
import { PayBillDto } from './dto/pay-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Bill } from './model/bill.model';

@ApiTags('bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bills')
export class BillsController {
  constructor(
    private readonly billsService: BillsService,

    @Inject(AZURE_BLOB_SERVICE)
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List bills' })
  @ApiResponse({ type: PaginatedResponse(Bill) })
  findAll(@Query() query: FindAllBillsDto) {
    return this.billsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill' })
  @ApiResponse({ type: Bill })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create bill' })
  @ApiResponse({ type: Bill })
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bill' })
  @ApiResponse({ type: Bill })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete bills' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.billsService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.delete(id);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay bill' })
  @ApiResponse({ type: Bill })
  pay(@Param('id', ParseIntPipe) id: number, @Body() dto: PayBillDto) {
    return this.billsService.pay(id, dto);
  }

  @Post(':id/invoice')
  @ApiOperation({ summary: 'Attach invoice to bill' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @Param('id', ParseIntPipe) id: number,
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
    const bill = await this.billsService.findOne(id);

    if (bill.file) {
      await this.azureBlobService.delete(bill.file.blob_path);
    }

    const blobPath = this.azureBlobService.buildBlobPath(
      'invoices/bills',
      id,
      file.originalname,
    );

    const url = await this.azureBlobService.upload(
      blobPath,
      file.buffer,
      file.mimetype,
    );

    return this.billsService.attachInvoice(id, {
      url,
      blob_path: blobPath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
    });
  }

  @Delete(':id/invoice')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove invoice from bill' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteInvoice(@Param('id', ParseIntPipe) id: number) {
    const bill = await this.billsService.findOne(id);

    if (bill.file) {
      await this.azureBlobService.delete(bill.file.blob_path);
    }

    await this.billsService.deleteInvoice(id);
  }
}
