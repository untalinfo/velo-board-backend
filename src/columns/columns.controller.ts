import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { Column } from './columns.schema';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(@Body() data: Partial<Column>) {
    return this.columnsService.create(data);
  }

  @Get()
  findAll() {
    return this.columnsService.findAll();
  }

  @Get('board/:boardId')
  findByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findByBoard(boardId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Column>) {
    return this.columnsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnsService.delete(id);
  }
}
