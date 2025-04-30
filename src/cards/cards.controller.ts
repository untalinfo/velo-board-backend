import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './cards.schema';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() data: Partial<Card>) {
    return this.cardsService.create(data);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get('column/:columnId')
  findByColumn(@Param('columnId') columnId: string) {
    return this.cardsService.findByColumn(columnId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Card>) {
    return this.cardsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.cardsService.delete(id);
  }
}
