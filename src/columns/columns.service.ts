import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Column, ColumnDocument } from './columns.schema';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  async create(data: Partial<Column>): Promise<Column> {
    if (!data.boardId) {
      throw new BadRequestException('Board ID is required');
    }

    // Obtener la última posición en el tablero
    const lastColumn = await this.columnModel
      .findOne({ boardId: data.boardId })
      .sort({ position: -1 })
      .exec();

    const position = lastColumn ? lastColumn.position + 1 : 0;

    return this.columnModel.create({
      ...data,
      position,
    });
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel.find().sort({ position: 1 }).exec();
  }

  async findByBoard(boardId: string): Promise<Column[]> {
    if (!boardId) {
      throw new BadRequestException('Board ID is required');
    }

    return this.columnModel.find({ boardId }).sort({ position: 1 }).exec();
  }

  async findById(id: string): Promise<Column> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid column ID');
    }

    const column = await this.columnModel.findById(id).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return column;
  }

  async update(id: string, data: Partial<Column>): Promise<Column> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid column ID');
    }

    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedColumn) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return updatedColumn;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid column ID');
    }

    const result = await this.columnModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
  }

  async moveColumn(
    columnId: string,
    newPosition: number,
    boardId: string,
  ): Promise<Column> {
    const column = await this.findById(columnId);
    const originalPosition = column.position;

    // Si la columna se mueve en el mismo tablero
    if (boardId === column.boardId) {
      if (newPosition > originalPosition) {
        // Mover hacia abajo
        await this.columnModel
          .updateMany(
            {
              boardId,
              position: { $gt: originalPosition, $lte: newPosition },
            },
            { $inc: { position: -1 } },
          )
          .exec();
      } else {
        // Mover hacia arriba
        await this.columnModel
          .updateMany(
            {
              boardId,
              position: { $gte: newPosition, $lt: originalPosition },
            },
            { $inc: { position: 1 } },
          )
          .exec();
      }
    }

    // Actualizar la posición de la columna
    return this.update(columnId, { position: newPosition });
  }
}
