const express = require("express");
const socket = require("socket.io");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const mongo = require("mongodb");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

const app = express();

// Express logic
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("lobby", {
        agreement: process.env.USAGE_TERMS || "",
        title: process.env.LOBBY_TITLE || "ConsoleChat",
        subtitle: process.env.LOBBY_SUBTITLE || "<ERROR> Subtitle not found! </ERROR>"
    });
});

app.get("/console", (req, res) => {
    res.render("console");
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    const HOST = server.address().address;
    console.log(`Server is running on ${HOST}:${PORT}`);
});

// Socket.io logic

const io = socket(server);
global.activeUsers = [];

io.on("connection", (socket) => {
    const timeSnap = moment().format("LLL [(]Z[)]");
    console.info("{{{[*", timeSnap, "*]}}}");
    console.log("* New client with id", socket.id, "is connected!");

    socket.emit("info-message", {
        from: "System",
        message: `Welcome to ConsoleChat! Type \"\\login <username> <password>\" to log  
        into your account or use\ "\\register <username> <password>\" to register a new one.`
    })

    socket.on("message", (data) => {
        if (typeof data.text != undefined && data.text !== "") {
            console.log("\"" + data.text + "\"");
            if (data.text[0] === '\\') {
                console.log("This is a command!");
                const commandParts = data.text
                    .substring(1)
                    .split(' ')
                    .filter(x => x !== "");
                console.log(commandParts)
                manageCommands(socket, ...commandParts);
            } else {
                if (data.text.length > 250) {
                    socket.emit("server-error", {
                        from: "System",
                        message: "Error! Message length limit is 250!"
                    })
                    return;
                }
                const activeUserIdx = activeUsers.findIndex(x => x.sockID === socket.id)
                if (activeUserIdx !== -1) {
                    for (let user of activeUsers) {
                        if (user.channel === activeUsers[activeUserIdx].channel) {
                            io.sockets.connected[user.sockID].emit("message-sent-success", {
                                from: activeUsers[activeUserIdx].username,
                                message: data.text,
                                time: moment().format('HH:mm'),
                                color: activeUsers[activeUserIdx].color
                            })

                            const client = new MongoClient(URI, {
                                useNewUrlParser: true,
                                useUnifiedTopology: true,
                            });

                            client.connect((err) => {
                                const db = client.db(DB);

                                if (err) {
                                    console.error(err);
                                }

                                db.collection("Channels")
                                    .updateOne({
                                        name: activeUsers[activeUserIdx].channel,
                                    }, {
                                        $push: {
                                            messages: {
                                                from: activeUsers[activeUserIdx].username,
                                                message: data.text,
                                                time: moment().format("HH:mm"),
                                                date: new Date(moment().format("YYYY-MM-DD")),
                                                color: activeUsers[activeUserIdx].color
                                            }
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        client.close();
                                    })
                                client.close();
                            })
                        }
                    }
                } else {
                    socket.emit("server-error", {
                        from: "System",
                        message: "Error! You must log into your account first to send messages!"
                    })
                }
            }
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const activeUserIdx = activeUsers.findIndex(x => x.sockID === socket.id);
        activeUsers.splice(activeUserIdx, 1);
    });
});

//Command Manager
const manageCommands = (socket, command, ...args) => {

    const pathCMD = path.join(__dirname, "models", "commands", command + ".js");
    fs.access(pathCMD, (err) => {
        if (err) {
            socket.emit("server-error", {
                from: "System",
                message: `Error! "\\${command}" is not a valid command!`
            })
        } else {
            const docCMD = require(pathCMD);
            docCMD[command](socket, ...args);
        }
    });
}