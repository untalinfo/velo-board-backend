import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ default: 0 })
  position: number;

  @Prop([String])
  tags: string[];
}

export const CardSchema = SchemaFactory.createForClass(Card);

// Crear índices
CardSchema.index({ columnId: 1, position: 1 });
CardSchema.index({ title: 'text' }); // Para búsquedas por texto
