const moment = require("moment");
const mongo = require("mongodb");

require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

exports.rewind = (socket, ...args) => {

    if (activeUsers.findIndex(x => x.sockID === socket.id) === -1) {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You are not logged in!"
        })
        return;
    }

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
            try {
                const lookupDate = moment()
                    .subtract(rewindDays, "days")
                    .format("YYYY-MM-DD")

                console.log(lookupDate);

                const client = new MongoClient(URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });

                client.connect((err) => {
                    const db = client.db(DB);

                    if (err) {
                        console.error(err);
                    }

                    // Database logic
                    db.collection("Channels")
                        .find({
                            name: "General",
                            messages: {
                                $elemMatch: {
                                    date: {
                                        "$gte": new Date(lookupDate)
                                    }
                                }
                            }
                        })
                        .toArray()
                        .then(result => {
                            if (result.length == 0) return;
                            result[0].messages.forEach(msg => { //Breakes if no messages are received
                                socket.emit("message-sent-success", {
                                    from: msg.from,
                                    message: msg.message,
                                    time: msg.time,
                                    color: msg.color
                                })
                            })
                            client.close;
                        })
                        .catch(err => {
                            console.error(err);
                        })
                    client.close();
                })
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}