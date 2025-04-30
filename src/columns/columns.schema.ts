import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema()
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  boardId: string;

  @Prop({ required: true })
  position: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

// Crear un índice compuesto para boardId y position
ColumnSchema.index({ boardId: 1, position: 1 }, { unique: true });
