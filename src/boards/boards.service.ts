import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './boards.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BoardsService implements OnModuleInit {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // Se ejecuta cuando el módulo se inicializa
  async onModuleInit() {
    await this.ensureDefaultBoardExists();
  }

  private async ensureDefaultBoardExists() {
    const defaultBoard = await this.boardModel
      .findOne({ isDefaultBoard: true })
      .exec();

    if (!defaultBoard) {
      await this.boardModel.create({
        title: 'VeloBoard',
        description: 'Default board for all users',
        members: [],
        owner: new Types.ObjectId(), // ID del sistema
        isDefaultBoard: true,
      });
    }
  }

  async getDefaultBoard(): Promise<Board> {
    const defaultBoard = await this.boardModel
      .findOne({ isDefaultBoard: true })
      .exec();
    if (!defaultBoard) {
      throw new NotFoundException('Default board not found');
    }
    return defaultBoard;
  }

  // Este método se usará cuando se cree un nuevo usuario
  async addMemberToDefaultBoard(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const defaultBoard = await this.getDefaultBoard();

    // Verificar si el usuario ya es miembro
    if (!defaultBoard.members.some((member) => member.toString() === userId)) {
      await this.boardModel
        .findByIdAndUpdate(defaultBoard._id, {
          $push: { members: new Types.ObjectId(userId) },
        })
        .exec();
    }
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel.find({ isArchived: false }).exec();
  }

  async findById(id: string): Promise<Board> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid board ID');
    }

    const board = await this.boardModel.findById(id).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async findByUser(userId: string): Promise<Board[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.boardModel
      .find({
        members: new Types.ObjectId(userId),
        isArchived: false,
      })
      .exec();
  }

  // Modificar el update para solo permitir cambios en el título y descripción
  async update(
    _id: Types.ObjectId,
    data: Partial<Board>,
    id: string,
  ): Promise<Board> {
    const board = await this.findById(id);

    if (board.isDefaultBoard) {
      // Solo permitir actualizar título y descripción
      const allowedUpdates: Partial<Board> = {
        title: data.title,
        description: data.description,
      };

      const updatedBoard = await this.boardModel
        .findByIdAndUpdate(id, allowedUpdates, { new: true })
        .exec();

      if (!updatedBoard) {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      this.eventsGateway.notifyBoardUpdate(id, updatedBoard);
      return updatedBoard;
    }

    throw new ForbiddenException(
      'Only the default board can be updated in this version',
    );
  }

  async addMember(
    boardId: string,
    memberId: string,
    userId: string,
  ): Promise<Board> {
    const board = await this.findById(boardId);

    // Solo el dueño puede agregar miembros
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the board owner can add members');
    }

    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member ID');
    }

    // Verificar si el usuario ya es miembro
    if (board.members.some((member) => member.toString() === memberId)) {
      throw new BadRequestException('User is already a member of this board');
    }

    const updatedBoard = await this.boardModel
      .findByIdAndUpdate(
        boardId,
        { $push: { members: new Types.ObjectId(memberId) } },
        { new: true },
      )
      .exec();

    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    this.eventsGateway.notifyBoardMemberAdded(boardId, {
      boardId,
      memberId,
      userId,
    });
    return updatedBoard;
  }

  async removeMember(
    boardId: string,
    memberId: string,
    userId: string,
  ): Promise<Board> {
    const board = await this.findById(boardId);

    // Solo el dueño puede remover miembros
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the board owner can remove members');
    }

    const updatedBoard = await this.boardModel
      .findByIdAndUpdate(
        boardId,
        { $pull: { members: new Types.ObjectId(memberId) } },
        { new: true },
      )
      .exec();

    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    this.eventsGateway.notifyBoardMemberRemoved(boardId, {
      boardId,
      memberId,
      userId,
    });
    return updatedBoard;
  }

  async archive(id: string, userId: string): Promise<Board> {
    const board = await this.findById(id);

    // Solo el dueño puede archivar el tablero
    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the board owner can archive it');
    }

    const updatedBoard = await this.boardModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();

    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return updatedBoard;
  }
}
