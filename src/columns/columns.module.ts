import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from './columns.schema';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { EventsModule } from '../events/events.module';
import { Board, BoardSchema } from '../boards/boards.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Board.name, schema: BoardSchema },
    ]),
    EventsModule,
  ],
  providers: [ColumnsService],
  controllers: [ColumnsController],
  exports: [ColumnsService],
})
export class ColumnsModule {}
