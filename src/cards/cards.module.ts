import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './cards.schema';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { EventsModule } from '../events/events.module';
import { Column, ColumnSchema } from '../columns/columns.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
    EventsModule,
  ],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService],
})
export class CardsModule {}
