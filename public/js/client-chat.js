const feedback = document.getElementById("feedback");
const input = document.getElementById("input");
const sendBTN = document.getElementById("sendBTN");

const server = location.origin;
const socket = io.connect(server, () => {
    console.log(`Connected to ${server} successfully.`);
});

const createSystemMSG = (data, ...classes) => {
    const systemMSG = document.createElement('p');
    systemMSG.classList.add(...classes);
    systemMSG.innerText = `[${data.from}] ${data.message}`
    feedback.appendChild(systemMSG);
    feedback.scrollTop = feedback.scrollHeight;
}

const createMSG = (data, ...classes) => {
    const message = document.createElement('p');
    message.classList.add(...classes);
    message.style.color = data.color;
    message.innerText = `[${data.from}](${data.time}) ${data.message}`
    feedback.appendChild(message);
    feedback.scrollTop = feedback.scrollHeight;
}

sendBTN.addEventListener("click", () => {
    socket.emit("message", {
        text: input.value
    })
    input.value = ""
})

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        socket.emit("message", {
            text: input.value
        })
        input.value = ""
    }
})

socket.on("server-success", (data) => {
    createSystemMSG(data, "system", "feed-anim");
})

socket.on("server-error", (data) => {
    createSystemMSG(data, "system", "system-error", "feed-anim")
})


socket.on("info-message", (data) => {
    createSystemMSG(data, "system", "system-info", "feed-anim")
})

socket.on("message-sent-success", (data) => {
    createMSG(data, "new-message", "feed-anim")
})

socket.on("clear", (data) => {
    feedback.innerHTML = "";
})