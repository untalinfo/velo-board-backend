const { io } = require('socket.io-client');

// Cambia la URL si tu backend no está en localhost:3001
const socket = io('ws://localhost:3001', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Conectado al backend Socket.io');

  // Unirse a un board (reemplaza por tu boardId real)
  const boardId = '6812b50b7fada5d229263693';
  socket.emit('joinBoard', boardId);
  console.log('🟢 Unido al board:', boardId);
});

// Escucha todos los eventos que lleguen
socket.onAny((event, data) => {
  console.log('📢 Evento recibido:', event, data);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado del backend');
});