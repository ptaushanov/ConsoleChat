exports.rewind = (socket, ...args) => {

    const definitions = {
        "today": 0,
        "yesterday": 1,
        "day": 1,
        "days": 1,
        "one": 1,
        "two": 2,
        "three": 3,
        "week": 7,
        "weeks": 7,
    }

    if (args.length < 1) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected at least 1 paramiters, but ${args.length} are given.`
        })
        return;
    }

    if (args[0] === "messages") {
        const keys = Object.keys(definitions);
        let rewindDays = 1;
        for (let idx = 1; idx < args.length; idx++) {
            if (keys.includes(args[idx])) {
                rewindDays *= definitions[args[idx]];
            } else if (!isNaN(args[idx])) {
                rewindDays *= parseInt(args[idx]);
            }
            console.log(rewindDays);
        }
        if (rewindDays > 14) {
            socket.emit("server-error", {
                from: "System",
                message: `Error! You can rewind messages up to 14 days only!`
            })
        } else {
            // Send messages to user 
        }
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}