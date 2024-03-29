const mongo = require("mongodb");
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

exports.login = (socket, ...args) => {

    if (activeUsers.findIndex(x => x.sockID === socket.id) !== -1) {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You are already logged in!"
        })
        return;
    }

    if (args.length !== 2) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected 2 paramiters, but ${args.length} are given.`
        })
        return;
    }

    const client = new MongoClient(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const userColors = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "routes", "user-colors.json")))

    client.connect((err) => {
        const db = client.db(DB);

        if (err) {
            console.error(err);
        }

        // Database logic
        const query = {
            username: args[0],
        }
        db.collection("Users")
            .find(query)
            .toArray()
            .then(result => {
                if (result.length > 0) {
                    if (bcrypt.compareSync(args[1], result[0].password)) {
                        const channel = "General"
                        activeUsers.push({
                            sockID: socket.id,
                            authToken: result[0].token,
                            username: result[0].username,
                            channel: channel,
                            color: userColors.default[Math.floor(Math.random() * userColors.default.length)],
                            role: result[0].role
                        })
                        socket.emit("server-success", {
                            from: "System",
                            message: `You are now logged in as ${result[0].username}.`,
                        })
                        setTimeout(() => {
                            socket.emit("info-message", {
                                from: "🛈Info",
                                message: `You are currently in the \"#${channel}\" channel.
                            To see available channels type: \"\\list channels\"`
                            })
                            const rewind = require("./rewind");
                            rewind["rewind"](socket, "messages", 1, "days");
                        }, 2500)
                    } else {
                        socket.emit("server-error", {
                            from: "System",
                            message: "Error! Wrong password!"
                        })
                    }
                } else {
                    socket.emit("server-error", {
                        from: "System",
                        message: "Error! No user with the given username and password!"
                    })
                }
            })
            .catch(err => {
                console.error(err);
                client.close();
            })

        client.close();
    });
}