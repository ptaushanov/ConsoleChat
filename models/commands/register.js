const mongo = require("mongodb");
const bcrypt = require('bcrypt');
const TokenGenerator = require('uuid-token-generator');

// Database using MongoDB
const MongoClient = mongo.MongoClient;
const URI = process.env.DB_URI;
const DB = process.env.DB_NAME;
const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

//Importing .env configurations
require('dotenv').config();

exports.register = (socket, ...args) => {

    if (activeUsers.findIndex(x => x.sockID === socket.id) !== -1) {
        socket.emit("server-error", {
            from: "System",
            message: "Error! You can't register a user while you are logged in!"
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

    client.connect((err) => {
        const db = client.db(DB);

        if (err) {
            console.error(err);
        }

        // Database logic
        db.collection("Users")
            .find({
                username: args[0]
            })
            .toArray()
            .then(result => {
                if (result.length > 0) {
                    console.log("User already exists!")
                    socket.emit("server-error", {
                        from: "System",
                        message: "Error! User already exists!"
                    })
                } else {
                    db.collection("Users")
                        .insertOne({
                            username: args[0],
                            password: bcrypt.hashSync(args[1], 10),
                            token: tokgen.generate(),
                            role: "Basic"
                        }, (err, res) => {
                            if (err) {
                                console.error(err);
                            } else {
                                socket.emit("server-success", {
                                    from: "System",
                                    message: `Successfully register user ${args[0]}.`
                                })
                            }
                        })
                    client.close();
                }
            })
            .catch(err => {
                console.error(err);
                client.close();
            })
    });
}