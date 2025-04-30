import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './cards.schema';

interface MoveCardDto {
  targetColumnId: string;
  newPosition: number;
}

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async create(@Body() data: Partial<Card>) {
    return this.cardsService.create(data);
  }

  @Get()
  async findAll() {
    return this.cardsService.findAll();
  }

  @Get('column/:columnId')
  async findByColumn(@Param('columnId') columnId: string) {
    return this.cardsService.findByColumn(columnId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.cardsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Card>) {
    return this.cardsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.cardsService.delete(id);
  }

  @Put(':id/move')
  async moveCard(@Param('id') id: string, @Body() moveCardDto: MoveCardDto) {
    return this.cardsService.moveCard(
      id,
      moveCardDto.targetColumnId,
      moveCardDto.newPosition,
    );
  }
}
