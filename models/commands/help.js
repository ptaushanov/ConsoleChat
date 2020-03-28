const fs = require("fs");
const path = require("path");

exports.help = (socket, ...args) => {
    if (args.length > 0) {
        // Give info about a specific command
    } else {
        const commandsFile = fs.readFileSync(path.join(__dirname, "..", "routes", "commands.json"))
        const commands = JSON.parse(commandsFile)
        let message = "\n\n"
        for (let command of commands) {
            message += command + "\n"
        }
        message += "\nType \"\\help <command>\" to see info about a specific command."
        socket.emit("info-message", {
            from: "Commands",
            message: message,
        })
    }
}