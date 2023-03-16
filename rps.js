"use strict";

class Main {
  args = process.argv
    .slice(2)
    .map((arg) => arg.trim())
    .filter((arg) => arg !== "");

  startGame() {
    if (new Validator(this.args).argsAreValid()) {
      const generator = new Generator();
      const key = generator.getHmacKey();
      const computerMove = Math.floor(Math.random() * this.args.length);
      const hmac = generator.getHmac(key, this.args[computerMove]);
      console.log("HMAC: " + hmac);
      new Menu().getMenu();
      this.getUserMove();
      if (this.userMove > 0 && this.userMove <= this.args.length) {
        console.log("Computer move: " + this.args[computerMove]);
        new Rules().getResult(this.userMove, computerMove);
        console.log("HMAC key: " + key);
        console.log("");
        this.startGame();
      }
    } else {
      new Validator(this.args).showError();
    }
  }

  getUserMove() {
    const reader = require("readline-sync");
    const move = reader.question("Enter your move: ");
    this.userMove = +move;
    if (move !== "" && +move === 0) {
      console.log("You exited the game");
    } else if (move === "?") {
      new Help().getTable();
      new Main().startGame();
    } else if (move > 0 && move <= this.args.length) {
      console.log(`Your move: ${this.args[move - 1]}`);
    } else {
      console.log("Error: Invalid move");
      new Menu().getMenu();
      this.getUserMove();
    }
  }
}

class Validator {
  constructor(args) {
    this.args = args;
    this.argsArray = new Set(args);
  }

  argsAreValid() {
    return (
      this.args.length > 2 &&
      this.args.length % 2 !== 0 &&
      this.args.length === this.argsArray.size
    );
  }

  showError() {
    let error = "Error: ";
    if (this.args.length < 3) {
      error += "Insufficient number of arguments. Enter at least 3 arguments";
    } else if (this.args.length % 2 === 0) {
      error += "Even number of arguments. Enter odd number of arguments";
    } else if (this.args.length !== this.argsArray.size) {
      error += "Repeated arguments. Enter an unique set of arguments";
    }
    console.log(error);
  }
}

class Menu {
  moves = new Main().args.reduce(
    (sum, arg, index) => sum + (index + 1) + " - " + arg + "\n",
    ""
  );

  getMenu() {
    console.log("Available moves:" + "\n" + this.moves + "0 - exit\n? - help");
  }
}

class Generator {
  crypto = require("crypto");

  getHmacKey() {
    return this.crypto
      .createHash("SHA3-256")
      .update(this.crypto.randomBytes(256).toString("hex"))
      .digest("hex")
      .toUpperCase();
  }

  getHmac(key, message) {
    return this.crypto
      .createHmac("SHA256", key)
      .update(message)
      .digest("hex")
      .toUpperCase();
  }
}

class Rules {
  getResult(userMove, computerMove) {
    const data = new Help().getData();
    if (userMove - 1 === computerMove) {
      console.log("It's a draw!");
    } else {
      console.log(
        "You " + data[userMove - 1][computerMove + 1].toLowerCase() + "!"
      );
    }
  }
}

class Help {
  getData() {
    const args = new Main().args;
    const data = [];
    let temp = [];
    args.forEach((e, index) => {
      for (let i = 1; i <= args.length; i++) {
        if (i - (index + 1) === 0) {
          temp.push("Draw");
        } else if (args.length - (index + 1) >= Math.floor(args.length / 2)) {
          if (i - (index + 1) > 0 && i - (index + 1) < args.length / 2) {
            temp.push("Lose");
          } else {
            temp.push("Win");
          }
        } else {
          if (index + 1 - i > 0 && index + 1 - i < args.length / 2) {
            temp.push("Win");
          } else {
            temp.push("Lose");
          }
        }
      }

      if (temp.length === args.length) {
        data.push([args[index].toUpperCase(), ...temp]);
        temp = [];
      }
    });
    return data;
  }

  getTable() {
    const args = new Main().args;
    const AsciiTable = require("ascii-table");
    const table = new AsciiTable();
    table
      .setHeading("Game Rules", ...args.map((arg) => arg.toUpperCase()))
      .addRowMatrix(this.getData())
      .setJustify();

    console.log(table.toString());
  }
}

new Main().startGame();
