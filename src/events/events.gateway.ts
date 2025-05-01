import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');
  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);
    this.logger.log(`Client connected: ${clientId}`);
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  // Board events
  notifyBoardUpdate(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('board:updated', data);
  }

  notifyBoardMemberAdded(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('board:memberAdded', data);
  }

  notifyBoardMemberRemoved(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('board:memberRemoved', data);
  }

  // Column events
  notifyColumnUpdate(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('column:updated', data);
  }

  notifyColumnCreated(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('column:created', data);
  }

  notifyColumnDeleted(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('column:deleted', data);
  }

  // Card events
  notifyCardUpdate(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('card:updated', data);
  }

  notifyCardCreated(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('card:created', data);
  }

  notifyCardDeleted(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('card:deleted', data);
  }

  notifyCardMoved(boardId: string, data: any) {
    this.server.to(`board:${boardId}`).emit('card:moved', data);
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(client: Socket, boardId: string) {
    client.join(`board:${boardId}`);
    this.logger.log(`Client ${client.id} joined board: ${boardId}`);
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(client: Socket, boardId: string) {
    client.leave(`board:${boardId}`);
    this.logger.log(`Client ${client.id} left board: ${boardId}`);
  }
}
