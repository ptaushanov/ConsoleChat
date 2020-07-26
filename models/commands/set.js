const mongo = require("mongodb");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

exports.set = (socket, ...args) => {
    const evokerID = activeUsers.findIndex(x => x.sockID === socket.id)
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
    });

    if (args[0] === "role") {
        const evokerRole = activeUsers[evokerID].role

        const query = {
            username: args[1],
        }
        client.connect((err) => {
            const db = client.db(DB);

            if (err) {
                console.error(err);
            }

            db.collection("Users")
                .find(query)
                .toArray()
                .then(result => {
                    if (result.length > 0) {
                        if (evokerRole === "Mod") {
                            if (args[2].toLowerCase() === "helper") {
                                //set the role in DB and Server
                            } else if (args[2].toLowerCase() === "basic") {
                                //set the role in DB and Server
                            } else {
                                socket.emit("server-error", {
                                    from: "System",
                                    message: `Error! Not enough permissions or invalid \"role\" argument!`
                                })
                            }
                        } else if (evokerRole === "Admin") {
                            switch (args[2].toLowerCase()) {
                                case 'mod':
                                    //set the role in DB and Server
                                    break;
                                case 'helper':
                                    //set the role in DB and Server
                                    break;
                                case 'basic':
                                    //set the role in DB and Server
                                    break;
                                default:
                                    socket.emit("server-error", {
                                        from: "System",
                                        message: `Error! Invalid \"role\" argument!`
                                    })
                                    break;
                            }
                        } else {
                            socket.emit("server-error", {
                                from: "System",
                                message: `Error! Not enough permissions to use this command!`
                            })
                        }
                    } else {
                        socket.emit("server-error", {
                            from: "System",
                            message: `Error! ${args[1]} is not a valid username!`
                        })
                    }
                })
                .catch(err => {
                    console.error(err);
                    client.close();
                })
            client.close();
        })
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
}