exports.clear = (socket, ...args) => {
    socket.emit("clear")
}