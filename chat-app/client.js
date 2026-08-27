const net = require("net");
const readline = require("readline");

const PORT = 3000;
const HOST = "localhost";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = net.createConnection(
  {
    port: PORT,
    host: HOST,
  },
  () => {
    console.log("Connected to chat server!");
    askUsername();
  }
);

function askUsername() {
  rl.question("Enter username: ", (username) => {
    socket.write(username + "\n");
  });
}

rl.on("line", (input) => {
  socket.write(input + "\n");
});

socket.on("data", (data) => {
  const message = data.toString();

  console.log(message.trim());

  if (message.includes("Username already taken")) {
    askUsername();
  }
});

socket.on("error", (err) => {
  console.log("Connection error:", err.message);
});

socket.on("close", () => {
  console.log("Disconnected from server");
  rl.close();
});