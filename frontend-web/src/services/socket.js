import { io } from 'socket.io-client';

export function connectSocket(token) {
  return io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000', { auth: { token } });
}
