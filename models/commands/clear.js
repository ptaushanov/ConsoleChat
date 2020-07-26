exports.clear = (socket, ...args) => {
    socket.emit("clear", {
        from: "System",
        message: "Cleared!"
    })
}