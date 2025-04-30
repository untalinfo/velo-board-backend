import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './columns.schema';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  async create(data: Partial<Column>): Promise<Column> {
    return this.columnModel.create(data);
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel.find().exec();
  }

  async findByBoard(boardId: string): Promise<Column[]> {
    return this.columnModel.find({ boardId }).exec();
  }

  async update(id: string, data: Partial<Column>): Promise<Column | null> {
    return this.columnModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<any> {
    return this.columnModel.findByIdAndDelete(id).exec();
  }
}
