import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './cards.schema';

@Injectable()
export class CardsService {
  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}

  async create(data: Partial<Card>): Promise<Card> {
    if (!data.columnId) {
      throw new BadRequestException('Column ID is required');
    }

    if (!Types.ObjectId.isValid(data.columnId)) {
      throw new BadRequestException('Invalid column ID');
    }

    // Obtener la última posición en la columna
    const lastCard = await this.cardModel
      .findOne({ columnId: data.columnId })
      .sort({ position: -1 })
      .exec();

    const position = lastCard ? lastCard.position + 1 : 0;

    return this.cardModel.create({
      ...data,
      position,
    });
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

    return this.cardModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Card | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid card ID');
    }

    return this.cardModel.findByIdAndDelete(id).exec();
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

    // Si la tarjeta se mueve a una nueva columna
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
      // Mover en la misma columna
      if (newPosition > originalPosition) {
        await this.cardModel
          .updateMany(
            {
              columnId: originalColumnId,
              position: { $gt: originalPosition, $lte: newPosition },
            },
            { $inc: { position: -1 } },
          )
          .exec();
      } else {
        await this.cardModel
          .updateMany(
            {
              columnId: originalColumnId,
              position: { $gte: newPosition, $lt: originalPosition },
            },
            { $inc: { position: 1 } },
          )
          .exec();
      }
    }

    // Actualizar la posición de la tarjeta
    const updatedCard = await this.update(cardId, {
      columnId: new Types.ObjectId(targetColumnId),
      position: newPosition,
    });

    if (!updatedCard) {
      throw new NotFoundException(`Card with id ${cardId} not found`);
    }

    return updatedCard;
  }
}
