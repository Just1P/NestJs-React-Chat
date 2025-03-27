import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

interface ConnectedUser {
  socketId: string;
  userId?: string;
  email?: string;
  lastSeen: Date;
  status: UserStatus;
}

type UsersMap = Map<string, ConnectedUser>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit {
  private logger = new Logger('ChatGateway');
  private connectedUsers: UsersMap = new Map();
  private usersByUserId: Map<string, ConnectedUser> = new Map();

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedUsers.set(client.id, {
      socketId: client.id,
      lastSeen: new Date(),
      status: UserStatus.ONLINE,
    });

    this.updateConnectedUsersList();
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const user = this.connectedUsers.get(client.id);

    this.connectedUsers.delete(client.id);

    if (user && user.userId && user.email) {
      this.logger.log(`User offline: ${user.email} (${user.userId})`);

      const updatedUser = {
        ...user,
        status: UserStatus.OFFLINE,
        lastSeen: new Date(),
      };

      this.usersByUserId.set(user.userId, updatedUser);
    }

    this.updateConnectedUsersList();
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: string): void {
    this.logger.log(`Received message: ${payload} from ${client.id}`);

    const user = this.connectedUsers.get(client.id);
    if (user) {
      user.lastSeen = new Date();
      this.connectedUsers.set(client.id, user);

      if (user.userId) {
        this.usersByUserId.set(user.userId, user);
      }
    }

    this.server.emit('messageFromBack', payload);

    this.updateConnectedUsersList();
  }

  @SubscribeMessage('register')
  handleRegister(
    client: any,
    payload: { userId: string; email: string },
  ): void {
    this.logger.log(`Registering user: ${payload.email} (${payload.userId})`);
    const user = this.connectedUsers.get(client.id);
    if (user) {
      const updatedUser = {
        ...user,
        userId: payload.userId,
        email: payload.email,
        lastSeen: new Date(),
        status: UserStatus.ONLINE,
      };

      this.connectedUsers.set(client.id, updatedUser);
      this.usersByUserId.set(payload.userId, updatedUser);

      this.logger.log(`User registered: ${payload.email} (${payload.userId})`);
    }

    this.updateConnectedUsersList();
  }

  @SubscribeMessage('messageLiked')
  handleMessageLiked(client: any, payload: { messageId: string }): void {
    this.logger.log(`Message liked: ${payload.messageId}`);
    this.server.emit('messageUpdateLikes', payload.messageId);
  }

  private updateConnectedUsersList(): void {
    const usersToSendMap = new Map<string, ConnectedUser>();

    Array.from(this.usersByUserId.values()).forEach((user) => {
      if (user.userId) {
        usersToSendMap.set(user.userId, user);
      }
    });

    Array.from(this.connectedUsers.values())
      .filter((user) => user.userId && user.email)
      .forEach((user) => {
        if (user.userId) {
          usersToSendMap.set(user.userId, user);
        }
      });

    const usersToSend = Array.from(usersToSendMap.values()).map((user) => ({
      userId: user.userId,
      email: user.email,
      lastSeen:
        user.lastSeen instanceof Date
          ? user.lastSeen.toISOString()
          : new Date(user.lastSeen).toISOString(),
      status: user.status,
    }));

    const userInfo = usersToSend.map((u) => ({
      email: u.email,
      lastSeen: u.lastSeen,
      status: u.status,
    }));
    this.logger.debug(`User details: ${JSON.stringify(userInfo)}`);

    this.logger.log(`Sending user list: ${usersToSend.length} users`);
    this.server.emit('connectedUsers', usersToSend);
  }
}
