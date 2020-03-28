exports.list = (socket, ...args) => {

    if (args.length < 1) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected at least 1 paramiters, but ${args.length} are given.`
        })
        return;
    }

    if (args[0] === "users" || args[0] === "Users") {
        let usernames, message = `List of online users:\n`;

        switch (args.length) {
            case 1:
                usernames = new Set(activeUsers.map(x => x.username))
                break;
            case 2:
                const channel = args[1];
                usernames = new Set(activeUsers
                    .filter(x => x.channel === channel)
                    .map(x => x.username)
                )
                break;
        }
        console.log(usernames)

        for (let username of usernames) {
            message += "○ " + username + "\n"
        }

        message += `\n Total count of listed users: ${usernames.size}.`

        if (activeUsers.findIndex(x => x.sockID === socket.id) !== -1) {
            socket.emit("info-message", {
                from: "🛈Info",
                message: message
            })
        } else {
            socket.emit("server-error", {
                from: "System",
                message: "Error! You are not logged in to use this command!"
            })
        }
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}