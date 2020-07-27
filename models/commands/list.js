const mongo = require("mongodb");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

exports.list = (socket, ...args) => {

    if (args.length < 1) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected at least 1 paramiters, but ${args.length} are given.`
        })
        return;
    }

    if (args[0].toLowerCase() === "users") {
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

        for (let username of usernames) {
            message += "❊ " + username + "\n"
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
    } else if (args[0].toLowerCase() === "channels") {
        const client = new MongoClient(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        client.connect((err) => {
            const db = client.db(DB);

            if (err) {
                console.error(err);
            }

            db.collection("Channels")
                .find()
                .project({
                    _id: 0,
                    name: 1
                })
                .toArray()
                .then(res => {
                    const names = res.map(x => x.name);
                    let message = "List of all channels:\n"
                    names.forEach(name => {
                        message += "❊ " + name + '\n'
                    })
                    socket.emit("info-message", {
                        from: "🛈Info",
                        message: message
                    })
                })
                .catch(err => {
                    console.error(err);
                    client.close();
                })
        })
        client.close();
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}