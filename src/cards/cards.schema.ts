import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  columnId: string;

  @Prop({ required: true })
  position: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const CardSchema = SchemaFactory.createForClass(Card);
