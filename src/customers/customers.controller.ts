import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomersService, CreateCustomerDto, UpdateCustomerDto } from './customers.service';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes com categorias' })
  findAll() { return this.customersService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do cliente' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.customersService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Cadastrar cliente' })
  create(@Body() dto: CreateCustomerDto) { return this.customersService.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }
}
