const net = require("net");

const PORT = 3000;

const users = new Map();

const server = net.createServer((socket) => {
  console.log("New client connected");

  let buffer = "";
  let username = null;

  socket.on("data", (data) => {
    buffer += data.toString();

    const messages = buffer.split("\n");

    buffer = messages.pop();

    for (const message of messages) {
      const text = message.trim();

      if (username === null) {
        if (text === "") {
          socket.write("Username cannot be empty.\n");
          continue;
        }

        if (users.has(text)) {
          socket.write("Username already taken.\n");
          continue;
        }

        username = text;
        users.set(username, socket);

        socket.write(`Welcome, ${username}!\n`);

        console.log(`User connected as: ${username}`);

        continue;
      }

      if (text === "/quit") {
        socket.write("Goodbye!\n");
        socket.end();
        continue;
  }
      if (text === "/who") {
         const usernames = [...users.keys()];

        socket.write(
          `Connected users:\n${usernames.join("\n")}\n`
    );

  continue;
}

      if (text.startsWith("/msg ")) {
        const parts = text.split(" ");

        const targetUsername = parts[1];
        const privateMessage = parts.slice(2).join(" ");

        if (!targetUsername || !privateMessage) {
          socket.write("Usage: /msg <username> <message>\n");
          continue;
        }

        const targetSocket = users.get(targetUsername);

        if (!targetSocket) {
          socket.write(
            `User "${targetUsername}" is not connected.\n`
          );
          continue;
        }

        targetSocket.write(
          `[DM from ${username}]: ${privateMessage}\n`
        );

        socket.write(
          `[you -> ${targetUsername}]: ${privateMessage}\n`
        );

        continue;
      }

      if (text !== "") {
        for (const [user, userSocket] of users) {
          if (userSocket !== socket) {
            userSocket.write(`[${username}]: ${text}\n`);
          }
        }
      }
    }
  });

  socket.on("error", (err) => {
    console.log("Socket error:", err.message);
  });

  socket.on("close", () => {
    console.log("Client disconnected");

    if (username !== null) {
      users.delete(username);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server is running on port ${PORT}`);
});