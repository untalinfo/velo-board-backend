import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './cards.schema';
import { EventsGateway } from '../events/events.gateway';
import { Column, ColumnDocument } from '../columns/columns.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(data: Partial<Card>): Promise<Card> {
    if (!data.columnId) {
      throw new BadRequestException('Column ID is required');
    }

    if (!Types.ObjectId.isValid(data.columnId)) {
      throw new BadRequestException('Invalid column ID');
    }

    if (!data.boardId) {
      throw new BadRequestException('Board ID is required');
    }

    if (!Types.ObjectId.isValid(data.boardId)) {
      throw new BadRequestException('Invalid board ID');
    }

    // Obtener la última posición en la columna
    const lastCard = await this.cardModel
      .findOne({ columnId: new Types.ObjectId(data.columnId) })
      .sort({ position: -1 })
      .exec();

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await this.cardModel.create({
      ...data,
      columnId: new Types.ObjectId(data.columnId),
      boardId: new Types.ObjectId(data.boardId),
      position,
    });

    this.eventsGateway.notifyCardCreated(card.boardId.toString(), card);
    return card;
  }

  async findAll(): Promise<Card[]> {
    return this.cardModel.find().sort({ position: 1 }).exec();
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column ID');
    }

    return this.cardModel
      .find({ columnId: new Types.ObjectId(columnId) })
      .sort({ position: 1 })
      .exec();
  }

  async findByBoard(boardId: string): Promise<Card[]> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new BadRequestException('Invalid column ID');
    }

    return this.cardModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ position: 1 })
      .exec();
  }

  async findById(id: string): Promise<Card> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid card ID');
    }

    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async update(id: string, data: Partial<Card>): Promise<Card | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid card ID');
    }

    // Si se está actualizando columnId, verificar que sea válido
    if (data.columnId && !Types.ObjectId.isValid(data.columnId)) {
      throw new BadRequestException('Invalid column ID');
    }
    // Si se está actualizando boardId, verificar que sea válido
    if (data.boardId && !Types.ObjectId.isValid(data.boardId)) {
      throw new BadRequestException('Invalid board ID');
    }

    const updateData = {
      ...data,
      ...(data.columnId && { columnId: new Types.ObjectId(data.columnId) }),
      ...(data.boardId && { boardId: new Types.ObjectId(data.boardId) }),
      updatedAt: new Date(),
    };

    const updatedCard = await this.cardModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedCard) {
      throw new NotFoundException('Card not found');
    }

    this.eventsGateway.notifyCardUpdate(
      updatedCard.boardId.toString(),
      updatedCard,
    );
    return updatedCard;
  }

  async delete(id: string): Promise<Card | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid card ID');
    }

    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const deletedCard = await this.cardModel.findByIdAndDelete(id).exec();
    this.eventsGateway.notifyCardDeleted(card.boardId.toString(), { id });
    return deletedCard;
  }

  async moveCard(
    cardId: string,
    targetColumnId: string,
    newPosition: number,
  ): Promise<Card> {
    if (!Types.ObjectId.isValid(cardId)) {
      throw new BadRequestException('Invalid card ID');
    }
    if (!Types.ObjectId.isValid(targetColumnId)) {
      throw new BadRequestException('Invalid column ID');
    }

    const card = await this.findById(cardId);
    const originalPosition = card.position;
    const originalColumnId = card.columnId;

    // Obtener la columna destino y su boardId
    const targetColumn = await this.columnModel.findById(targetColumnId).exec();
    if (!targetColumn) {
      throw new NotFoundException('Target column not found');
    }
    const newBoardId = targetColumn.boardId;

    if (targetColumnId !== originalColumnId.toString()) {
      // Reordenar tarjetas en la columna original
      await this.cardModel
        .updateMany(
          {
            columnId: originalColumnId,
            position: { $gt: originalPosition },
          },
          { $inc: { position: -1 } },
        )
        .exec();

      // Hacer espacio en la nueva columna
      await this.cardModel
        .updateMany(
          {
            columnId: new Types.ObjectId(targetColumnId),
            position: { $gte: newPosition },
          },
          { $inc: { position: 1 } },
        )
        .exec();
    } else {
      // Mover en la misma columna usando posición temporal para evitar conflicto de índice único
      if (newPosition > originalPosition) {
        await this.cardModel.findByIdAndUpdate(cardId, { position: -1 });
        await this.cardModel.updateMany(
          {
            columnId: originalColumnId,
            position: { $gt: originalPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } },
        );
        await this.cardModel.findByIdAndUpdate(cardId, {
          position: newPosition,
          columnId: new Types.ObjectId(targetColumnId),
          boardId: newBoardId,
        });
      } else if (newPosition < originalPosition) {
        await this.cardModel.findByIdAndUpdate(cardId, { position: -1 });
        await this.cardModel.updateMany(
          {
            columnId: originalColumnId,
            position: { $gte: newPosition, $lt: originalPosition },
          },
          { $inc: { position: 1 } },
        );
        await this.cardModel.findByIdAndUpdate(cardId, {
          position: newPosition,
          columnId: new Types.ObjectId(targetColumnId),
          boardId: newBoardId,
        });
      }
    }

    // Actualizar la posición, columnId y boardId de la tarjeta
    await this.cardModel.findByIdAndUpdate(cardId, {
      position: newPosition,
      columnId: new Types.ObjectId(targetColumnId),
      boardId: newBoardId,
    });
    const updatedCard = await this.cardModel.findById(cardId);

    if (!updatedCard) {
      throw new NotFoundException(`Card with id ${cardId} not found`);
    }

    this.eventsGateway.notifyCardMoved(newBoardId.toString(), {
      cardId,
      targetColumnId,
      newPosition,
    });

    return updatedCard;
  }
}
