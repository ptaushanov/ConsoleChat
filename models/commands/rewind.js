const moment = require("moment");
const mongo = require("mongodb");

// Importing secrets from .env
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

// Rewind cmdlet
exports.rewind = (socket, ...args) => {
    const evokerID = activeUsers.findIndex(x => x.sockID === socket.id)
    const channelName = activeUsers[evokerID].channel;

    // Allow only users that are logged in use this cmdlet
    if (evokerID === -1) {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You are not logged in!"
        })
        return;
    }

    // Table of definitions for days
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

    // Send an error if the user does not supply needed arguments
    if (args.length < 1) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected at least 1 paramiters, but ${args.length} are given.`
        })
        return;
    }

    // If first argument is a message 
    if (args[0] === "messages") {
        // Get an array from all definition keys
        const keys = Object.keys(definitions);
        let defLock = false;
        let multLock = false;
        let rewindDays = 1;

        // Loop through all arguments and check if the keys array includes them 
        for (let idx = 1; idx < args.length; idx++) {
            if (keys.includes(args[idx]) && !defLock) {
                // If it does multiply the value of the definition with the rewindDays
                rewindDays *= definitions[args[idx]];
                defLock = true;
            } else if (!isNaN(args[idx]) && !multLock) {
                // If it does't check if the argument is a number and if it is then multiply
                rewindDays *= parseInt(args[idx]);
                multLock = true;
            }
            console.log(rewindDays);
        }

        // Send an error if the rewind days are more then 14
        if (rewindDays > 14) {
            socket.emit("server-error", {
                from: "System",
                message: `Error! You can rewind messages up to 14 days only!`
            })
        } else {
            try {
                // Create a reference date 
                const lookupDate = moment()
                    .subtract(rewindDays, "days")
                    .format("YYYY-MM-DD")

                console.log(lookupDate);

                // Setup the DB client
                const client = new MongoClient(URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });

                // Connect to DB through client
                client.connect((err) => {
                    const db = client.db(DB);

                    // Log any errors
                    if (err) {
                        console.error(err);
                    }

                    // Database logic
                    db.collection("Channels")
                        .find({
                            name: channelName, // Current channel of evoker
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
                            result[0].messages.forEach(msg => {
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

                    // Close the client
                    client.close();
                })
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        // Send an error if the arguments are wrong
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}