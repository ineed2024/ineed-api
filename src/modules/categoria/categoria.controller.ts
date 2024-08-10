import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  async listar() {
    return {
      categoria: await this.categoriaService.listar(),
    };
  }

  @Get(':id')
  async listarPorId(@Param('id') id: string) {
    return {
      categoria: await this.categoriaService.listarPorId(+id),
    };
  }
}
