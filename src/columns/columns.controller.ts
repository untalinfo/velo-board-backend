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
import { ColumnsService } from './columns.service';
import { Column } from './columns.schema';

interface MoveColumnDto {
  newPosition: number;
  boardId: string;
}

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async create(@Body() data: Partial<Column>) {
    return this.columnsService.create(data);
  }

  @Get()
  async findAll() {
    return this.columnsService.findAll();
  }

  @Get('board/:boardId')
  async findByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findByBoard(boardId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.columnsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Column>) {
    return this.columnsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.columnsService.delete(id);
  }

  @Put(':id/move')
  async moveColumn(
    @Param('id') id: string,
    @Body() moveColumnDto: MoveColumnDto,
  ) {
    return this.columnsService.moveColumn(
      id,
      moveColumnDto.newPosition,
      moveColumnDto.boardId,
    );
  }
}
