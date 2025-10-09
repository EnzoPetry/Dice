const SOCKET_KEY = Symbol.for('app.socket.io');

export function setIO(io) {
	globalThis[SOCKET_KEY] = io;
}

export function getIO() {
	const io = globalThis[SOCKET_KEY];
	if (io) {
		return io;
	}
	return null;
}

export function emitToGroup(groupId, event, data) {
	const io = getIO();
	if (io) {
		io.to(`group_${groupId}`).emit(event, data);
		return true;
	}
	return false;
}