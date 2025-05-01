import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: '#FFFFFF' })
  backgroundColor: string;

  @Prop({ default: false })
  isDefaultBoard: boolean;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

// Crear índices
BoardSchema.index({ isDefaultBoard: 1 }, { unique: true, sparse: true });
