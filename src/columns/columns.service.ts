import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Column, ColumnDocument } from './columns.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    private readonly eventsGateway: EventsGateway,
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

    // Si no hay columnas, empezar desde 0, si hay, usar la siguiente posición
    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await this.columnModel.create({
      ...data,
      position,
    });

    this.eventsGateway.notifyColumnCreated(data.boardId, column);
    return column;
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

  async update(id: string, data: Partial<Column>): Promise<Column | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid column ID');
    }

    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updatedColumn) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    this.eventsGateway.notifyColumnUpdate(updatedColumn.boardId, updatedColumn);
    return updatedColumn;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid column ID');
    }

    const column = await this.columnModel.findById(id).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    await this.columnModel.findByIdAndDelete(id).exec();

    // Reordenar las columnas restantes
    await this.columnModel
      .updateMany(
        {
          boardId: column.boardId,
          position: { $gt: column.position },
        },
        { $inc: { position: -1 } },
      )
      .exec();

    this.eventsGateway.notifyColumnDeleted(column.boardId, { id });
  }

  async moveColumn(
    columnId: string,
    newPosition: number,
    boardId: string,
  ): Promise<Column> {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    const originalPosition = column.position;

    if (newPosition === originalPosition) {
      return column;
    }

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

    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(columnId, { position: newPosition }, { new: true })
      .exec();

    if (!updatedColumn) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    this.eventsGateway.notifyColumnUpdate(boardId, updatedColumn);
    return updatedColumn;
  }
}
