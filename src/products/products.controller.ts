import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './product.interface';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public — anyone (including the Flutter customer app, eventually) can browse
  @Get()
  async findAll() {
    const products = await this.productsService.findAll();
    return products.map((p) => ({
      ...p,
      status: this.productsService.getStatus(p),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return { ...product, status: this.productsService.getStatus(product) };
  }

  // Everything below this line requires a verified admin token
  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: Request) {
    const adminId = (req as any).user.user_id;
    return this.productsService.create(dto, adminId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(':id/publish')
  setPublished(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.productsService.setPublished(id, isPublished);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}