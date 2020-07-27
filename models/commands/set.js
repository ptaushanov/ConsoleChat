const mongo = require("mongodb");

//Importing .env configurations
require('dotenv').config();

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;

const setRole = (username, role) => {
    const activeID = activeUsers.findIndex(x => x.username === username)
    if (activeID !== -1) {
        activeUsers[activeID].role = role;
    }
}

const setRoleDB = (db, username, role) => {
    db.collection("Users")
        .updateOne({
            username: username
        }, {
            $set: {
                "role": role
            }
        })
}

const sendRoleMSG = (socket, username, role) => {
    socket.emit("server-success", {
        from: "System",
        message: `Successfully set ${username}'s role to ${role}.`
    });
}

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
        const username = args[1];

        const query = {
            username: username,
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
                        if (evokerRole === "Helper") {
                            if (args[2].toLowerCase() === "basic") {
                                setRole(username, "Basic")
                                setRoleDB(db, username, "Basic")
                                sendRoleMSG(socket, username, "Basic")
                            } else {
                                socket.emit("server-error", {
                                    from: "System",
                                    message: `Error! Not enough permissions or invalid \"role\" argument!`
                                })
                            }
                        } else if (evokerRole === "Mod") {
                            if (args[2].toLowerCase() === "helper") {
                                setRole(username, "Helper")
                                setRoleDB(db, username, "Helper")
                                sendRoleMSG(socket, username, "Helper")
                            } else if (args[2].toLowerCase() === "basic") {
                                setRole(username, "Basic")
                                setRoleDB(db, username, "Basic")
                                sendRoleMSG(socket, username, "Basic")
                            } else {
                                socket.emit("server-error", {
                                    from: "System",
                                    message: `Error! Not enough permissions or invalid \"role\" argument!`
                                })
                            }
                        } else if (evokerRole === "Admin") {
                            switch (args[2].toLowerCase()) {
                                case 'mod':
                                    setRole(username, "Mod")
                                    setRoleDB(db, username, "Mod")
                                    sendRoleMSG(socket, username, "Mod")
                                    break;
                                case 'helper':
                                    setRole(username, "Helper")
                                    setRoleDB(db, username, "Helper")
                                    sendRoleMSG(socket, username, "Helper")
                                    break;
                                case 'basic':
                                    setRole(username, "Basic")
                                    setRoleDB(db, username, "Basic")
                                    sendRoleMSG(socket, username, "Basic")
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
        })
    } else {
        socket.emit("server-error", {
            from: "System",
            message: `Error! Unknown paramiter \"${args[0]}\"!`
        })
    }
    client.close();
}