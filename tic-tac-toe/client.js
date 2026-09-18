const net = require("node:net");
const readline = require("node:readline");

let mySymbol = null;
let board = ["_", "_", "_", "_", "_", "_", "_", "_", "_"];
let gameOver = false;

const client = net.connect(3000, "localhost", () => {
    console.log("Connected to server");
});

function printBoard() {
    console.log("");
    console.log(` ${board[0]} | ${board[1]} | ${board[2]}`);
    console.log("-----------");
    console.log(` ${board[3]} | ${board[4]} | ${board[5]}`);
    console.log("-----------");
    console.log(` ${board[6]} | ${board[7]} | ${board[8]}`);
    console.log("");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let buffer = "";

client.on("data", (data) => {
    buffer += data.toString();

    const lines = buffer.split("\n");

    buffer = lines.pop();

    for (const line of lines) {
        const message = line.trim();

        if (!message) {
            continue;
        }

        if (message.startsWith("SYMBOL|")) {
            mySymbol = message.split("|")[1];

            console.log(`You are player ${mySymbol}`);
            continue;
        }

        if (message.startsWith("BOARD|")) {
            const values = message.split("|")[1].split(",");

            board = values;

            printBoard();
            continue;
        }

        if (message.startsWith("TURN|")) {
            const currentTurn = message.split("|")[1];

         if (currentTurn === mySymbol) {
                console.log("Your turn!");
                console.log("Enter a number from 0 to 8:");
            } else {
                console.log(`Waiting for ${currentTurn}...`);
            }

            continue;
        }

        if (message.startsWith("REJECTED|")) {
         const reason = message.split("|")[1];

            console.log(`Rejected: ${reason}`);
            continue;
        }

        if (message.startsWith("WIN|")) {
            const winner = message.split("|")[1];

            gameOver = true;

            if (winner === mySymbol) {
                console.log("You won!");
            } else {

         console.log(`Player ${winner} won!`);
            }

            rl.close();
            continue;
        }

        if (message === "DRAW") {
            gameOver = true;

            console.log("DRAW! Nobody won.");

            rl.close();
            continue;
        }

        if (message === "OPPONENT_LEFT") {
            gameOver = true;

            console.log("Opponent left the game.");

            rl.close();
            continue;
        }
    }
});

rl.on("line", (input) => {
    if (gameOver) {
        return;
    }
    

    const value = input.trim();

    if (value === "") {
        return;
    }

    client.write(`MOVE|${value}\n`);
});

client.on("close", () => {
    console.log("Disconnected from server");
});

client.on("error", (error) => {
    console.log("Connection error:", error.message);
});