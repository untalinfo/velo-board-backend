import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
    try {
      if (!data.boardId) {
        throw new BadRequestException('El ID del tablero es requerido');
      }

      if (!Types.ObjectId.isValid(data.boardId)) {
        throw new BadRequestException('El ID del tablero no es válido');
      }

      // Verificar si el board existe
      const boardExists = await this.columnModel.findOne({
        boardId: data.boardId,
      });
      if (!boardExists) {
        throw new BadRequestException('El tablero especificado no existe');
      }

      const lastColumn = await this.columnModel
        .findOne({ boardId: data.boardId })
        .sort({ position: -1 })
        .exec();

      const position = lastColumn ? lastColumn.position + 1 : 0;

      const column = await this.columnModel.create({
        ...data,
        position,
      });

      this.eventsGateway.notifyColumnCreated(data.boardId.toString(), column);
      return column;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        'Error al crear la columna: ' + errorMessage,
      );
    }
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
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('El ID de la columna no es válido');
      }

      const updatedColumn = await this.columnModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();

      if (!updatedColumn) {
        throw new NotFoundException(`No se encontró la columna con ID ${id}`);
      }

      this.eventsGateway.notifyColumnUpdate(
        updatedColumn.boardId.toString(),
        updatedColumn,
      );
      return updatedColumn;
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        'Error al actualizar la columna: ' + errorMessage,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('El ID de la columna no es válido');
      }

      const column = await this.columnModel.findById(id).exec();
      if (!column) {
        throw new NotFoundException(`No se encontró la columna con ID ${id}`);
      }

      await this.columnModel.findByIdAndDelete(id).exec();

      await this.columnModel
        .updateMany(
          {
            boardId: column.boardId,
            position: { $gt: column.position },
          },
          { $inc: { position: -1 } },
        )
        .exec();

      this.eventsGateway.notifyColumnDeleted(column.boardId.toString(), { id });
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        'Error al eliminar la columna: ' + errorMessage,
      );
    }
  }

  async moveColumn(
    columnId: string,
    newPosition: number,
    boardId: string,
  ): Promise<Column> {
    try {
      if (!Types.ObjectId.isValid(columnId)) {
        throw new BadRequestException('El ID de la columna no es válido');
      }

      if (!Types.ObjectId.isValid(boardId)) {
        throw new BadRequestException('El ID del tablero no es válido');
      }

      const column = await this.columnModel.findById(columnId).exec();
      if (!column) {
        throw new NotFoundException(
          `No se encontró la columna con ID ${columnId}`,
        );
      }

      const originalPosition = column.position;

      if (newPosition === originalPosition) {
        return column;
      }

      if (boardId === column.boardId.toString()) {
        if (newPosition > originalPosition) {
          await this.columnModel
            .updateMany(
              {
                boardId: column.boardId,
                position: { $gt: originalPosition, $lte: newPosition },
              },
              { $inc: { position: -1 } },
            )
            .exec();
        } else {
          await this.columnModel
            .updateMany(
              {
                boardId: column.boardId,
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
        throw new NotFoundException(
          `No se encontró la columna con ID ${columnId}`,
        );
      }

      this.eventsGateway.notifyColumnUpdate(boardId, updatedColumn);
      return updatedColumn;
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        'Error al mover la columna: ' + errorMessage,
      );
    }
  }
}
