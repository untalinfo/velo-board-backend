import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true })
  position: number;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

// Crear índice para mejorar el rendimiento de las consultas por boardId
ColumnSchema.index({ boardId: 1 });
