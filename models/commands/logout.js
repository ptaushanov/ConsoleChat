exports.logout = (socket) => {
    const activeUserIdx = activeUsers.findIndex(x => x.sockID === socket.id)
    if (activeUserIdx !== -1) {
        activeUsers.splice(activeUserIdx, 1);
        socket.emit("server-success", {
            from: "System",
            message: "You logged out successfully!"
        })
        setTimeout(() => {
            socket.emit("info-message", {
                from: "🛈Info",
                message: `You won't recive any messages when you are logged out.`
            })
        }, 2500)
    } else {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You are not currently logged in!"
        })
    }
}