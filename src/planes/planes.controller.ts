import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PlanesService, CreatePlaneDto, UpdatePlaneDto } from './planes.service';

@ApiTags('planes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar aeronaves' })
  findAll() { return this.planesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da aeronave' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.planesService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Cadastrar aeronave' })
  create(@Body() dto: CreatePlaneDto) { return this.planesService.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar aeronave' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlaneDto) {
    return this.planesService.update(id, dto);
  }
}
