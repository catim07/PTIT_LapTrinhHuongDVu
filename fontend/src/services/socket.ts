import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_HOST 
  ? import.meta.env.VITE_API_HOST.replace('/api', '') 
  : 'http://127.0.0.1:3001';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});
