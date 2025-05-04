import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from './columns.schema';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { EventsModule } from '../events/events.module';
import { Board, BoardSchema } from '../boards/boards.schema';
import { Card, CardSchema } from '../cards/cards.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Board.name, schema: BoardSchema },
      { name: Card.name, schema: CardSchema }, // Assuming Card schema is similar to Column
    ]),
    EventsModule,
  ],
  providers: [ColumnsService],
  controllers: [ColumnsController],
  exports: [ColumnsService],
})
export class ColumnsModule {}
