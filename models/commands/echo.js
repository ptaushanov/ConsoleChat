exports.echo = (socket, ...args) => {
    const message = args.join(" ")
    socket.emit("info-message", { from: "ECHO", message })
}