import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.schema';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('default')
  async getDefaultBoard() {
    return this.boardsService.getDefaultBoard();
  }

  @Get()
  async findAll() {
    return this.boardsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.boardsService.findByUser(userId);
  }

  @Put('default')
  async updateDefaultBoard(
    @Body() data: Partial<Board>,
    // TODO: Obtener userId del token JWT cuando implementemos auth
    @Body('userId') userId: string,
  ) {
    const defaultBoard = await this.boardsService.getDefaultBoard();
    return this.boardsService.update(defaultBoard._id, data, userId);
  }
}
