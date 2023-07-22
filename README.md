# 🗨️ Console Chat 🗨️

### Chat with friends and run cool and powerful commands

Chat application for chatting and running commands in a console like
environment.

---

### 🔨 Built With 🔨

- [Visual Studio Code](https://code.visualstudio.com/) - _The IDE used_

---

### ⚒️ Made with ⚒️

- [Express JS](https://expressjs.com/)
- [Socket IO](https://socket.io/)
- [EJS](https://ejs.co/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [Moment](https://momentjs.com/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [MongoDB](https://www.mongodb.com/)

- [NodeJS](https://nodejs.org/en/)
- [Nodemon](https://www.npmjs.com/package/nodemon)

---

### 💅 Styles provided by 💅

- [Bulma](https://bulma.io/)

---

### 👨‍💻 Author 👨‍💻

- **Petar Taushanov** - [ptaushanov](https://github.com/ptaushanov)

---

### ⚙️ Setting up the project ⚙️

1. Create a `.env` file in the root directory
2. Add the following in the file

```
# DB Secrets

DB_URI = 
DB_NAME = 

# Lobby Manager

USAGE_TERMS = 
LOBBY_TITLE = "ConsoleChat"
LOBBY_SUBTITLE = "Boost the ordinary chat with powerful, yet simple chat commands!"
```

3. After the **=** sign fill the missing information, where:
   - **DB_URI** is the URI for the MongoDB database (can be local or hosted
     somewhere )
   - **DB_NAME** is the name of the MongoDB database that you want to use
   - **USAGE_TERMS** are the terms shown to the user on front page
   - **LOBBY_TITLE** is the title shown to the user on front page
   - **LOBBY_SUBTITLE** are the subtitles shown to the user on front page

---

### ⚙️ Running the project ⚙️

```bash
npm run start
```

OR

```bash
npm run dev
```

The second option tracks changes in the project structure with **Nodemon**

**Default port is set to 3000**\
It can be changed in the **"server.js"** script.

---

### 🪄 Using Commands 🪄

Commands can must start with the leading `\` before the name of the command.
Most used commands are:

- `\login` -> login as a user with a username and password as arguments to the
  command
- `\register` -> register a new user with a username and password as arguments
  to the command
- `\clear` -> clear the messages "screen"
- `\help` -> find helpful commands

### License

---

This project is licensed under the MIT License - _see the_
[LICENSE.md](https://github.com/ptaushanov/ConsoleChat/blob/master/LICENSE)
_file for details._
