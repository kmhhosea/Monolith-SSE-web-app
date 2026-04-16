'use client';

import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

export function createRealtimeSocket(token: string) {
  return io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'],
    auth: {
      token
    }
  });
}
