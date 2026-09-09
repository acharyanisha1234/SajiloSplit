const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join user room for private notifications
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Join group room for group notifications
    socket.on('join-group', (groupId) => {
      socket.join(`group-${groupId}`);
      console.log(`👥 User joined group ${groupId}`);
    });

    // Leave group room
    socket.on('leave-group', (groupId) => {
      socket.leave(`group-${groupId}`);
      console.log(`👥 User left group ${groupId}`);
    });

    // Send notification to user
    socket.on('send-notification', (data) => {
      const { userId, notification } = data;
      io.to(`user-${userId}`).emit('notification', notification);
      console.log(`📨 Notification sent to user ${userId}`);
    });

    // Send notification to group
    socket.on('send-group-notification', (data) => {
      const { groupId, notification } = data;
      io.to(`group-${groupId}`).emit('notification', notification);
      console.log(`📨 Group notification sent to group ${groupId}`);
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const { groupId, userId, isTyping } = data;
      socket.to(`group-${groupId}`).emit('typing', { userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle server-side errors
  io.on('error', (error) => {
    console.error('Socket.IO server error:', error);
  });

  console.log(' Socket.IO server initialized');
};

module.exports = socketHandler;