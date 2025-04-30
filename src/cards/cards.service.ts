import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './cards.schema';

@Injectable()
export class CardsService {
  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}

  async create(data: Partial<Card>): Promise<Card> {
    return this.cardModel.create(data);
  }

  async findAll(): Promise<Card[]> {
    return this.cardModel.find().exec();
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return this.cardModel.find({ columnId }).exec();
  }

  async update(id: string, data: Partial<Card>): Promise<Card | null> {
    return this.cardModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<Card | null> {
    return this.cardModel.findByIdAndDelete(id).exec();
  }
}
