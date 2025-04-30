import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema()
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  position: number;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
