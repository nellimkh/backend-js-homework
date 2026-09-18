const net = require("node:net");

const clients = [];

let board = ["_", "_", "_", "_", "_", "_", "_", "_", "_"];
let currentTurn = "X";
let gameOver = false;

function send(socket, message) {
    socket.write(message + "\n");
}

function broadcast(message) {
    clients.forEach((client) => {
        send(client, message);
    });
}

function checkWinner() {
    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of winningLines) {
      if (
            board[a] !== "_" &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

function checkDraw() {
    return board.every((cell) => cell !== "_");
}

function resetGame() {
    board = ["_", "_", "_", "_", "_", "_", "_", "_", "_"];
    currentTurn = "X";
    gameOver = false;
}

const server = net.createServer((socket) => {
    if (clients.length >= 2) {
        send(socket, "REJECTED|server is full");
        socket.end();
        return;
    }

    clients.push(socket);

    const symbol = clients.length === 1 ? "X" : "O";

    send(socket, `SYMBOL|${symbol}`);

    console.log(`Player ${clients.length} connected as ${symbol}`);

    if (clients.length === 2) {
        broadcast(`BOARD|${board.join(",")}`);
        broadcast(`TURN|${currentTurn}`);
    }

    let buffer = "";

    socket.on("data", (data) => {
        buffer += data.toString();

        const lines = buffer.split("\n");

        buffer = lines.pop();

        for (const line of lines) {
            const message = line.trim();

            if (!message) {
                continue;
            }

            if (!message.startsWith("MOVE|")) {
                continue;
            }

            const value = message.split("|")[1];
            const index = Number(value);

            if (gameOver) {
                send(socket, "REJECTED|game is over");
                continue;
            }

            if (clients.length < 2) {
                send(socket, "REJECTED|waiting for opponent");
                continue;
            }

            if (symbol !== currentTurn) {
                send(socket, "REJECTED|not your turn");
                continue;
            }

            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index > 8
            ) {
                send(socket, "REJECTED|invalid cell");
                continue;
            }

            if (board[index] !== "_") {
                send(socket, "REJECTED|cell is already occupied");
                continue;
            }

            board[index] = symbol;

            broadcast(`BOARD|${board.join(",")}`);

            const winner = checkWinner();

            if (winner) {
                broadcast(`WIN|${winner}`);
                gameOver = true;
                continue;
            }

            if (checkDraw()) {
                broadcast("DRAW");
                gameOver = true;
                continue;
            }

            currentTurn = currentTurn === "X" ? "O" : "X";

            broadcast(`TURN|${currentTurn}`);
        }
    });

    socket.on("close", () => {
        console.log(`Player ${symbol} disconnected`);

        const index = clients.indexOf(socket);

        if (index !== -1) {
            clients.splice(index, 1);
        }

        if (clients.length === 1) {
            send(clients[0], "OPPONENT_LEFT");
        }

        if (clients.length === 0) {
            resetGame();
        }
    });

    socket.on("error", (error) => {
    console.log("Socket error:", error.message);
    });
});

server.listen(3000, () => {
console.log("Server is listening on port 3000");
});