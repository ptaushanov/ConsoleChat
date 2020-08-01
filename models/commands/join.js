const mongo = require("mongodb");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

exports.join = (socket, ...args) => {
    const evokerID = activeUsers.findIndex(x => x.sockID === socket.id);
    if (evokerID === -1) {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You are not logged in!"
        })
        return;
    }

    if (args.length < 1) {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Expected at least 1 paramiters, but ${args.length} are given.`
        })
        return;
    }

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
                name: 1,
                settings: 1
            })
            .toArray()
            .then(res => {
                const names = res.map(x => x.name);
                if (names.includes(args[0])) {
                    // Check if user is blacklisted

                    socket.emit("clear");
                    // Change evoker's channel
                    activeUsers[evokerID].channel = args[0];

                    // Check if it has at least 2 args the check if it is true
                    if (args.length > 1) {
                        if (args[1] == "true") { // [showMSG]
                            socket.emit("info-message", {
                                from: "🛈Info",
                                message: `Joined \"${args[0]}\" channel!`
                            })
                        }
                    }

                    // Rewind Messages from evoker's channel
                    const rewind = require("./rewind");
                    rewind["rewind"](socket, "messages", 1, "days");

                    // Close client
                    client.close();
                } else {
                    socket.emit("server-error", {
                        from: "System",
                        message: `Error! \"${args[0]}\" is not a valid channel name!`
                    })
                    client.close();
                }
            })
            .catch(err => {
                console.error(err);
                client.close();
            })
    })
}