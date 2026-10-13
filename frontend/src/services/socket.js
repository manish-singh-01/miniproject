import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', { autoConnect: false });
  }
  return socket;
};

export const connectSocket = (user) => {
  const s = getSocket();
  s.connect();
  s.on('connect', () => {
    s.emit('join', { userId: user._id, role: user.role });
  });
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
