const Parser = require("./Parser.js");
const Lang = require("./Lang.js");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const repl = function() {
    rl.question("> ", function(answer) {
        try {
            const [value, type] = Parser.evaluate(answer);
            console.log(value.toString());
            console.log(type.toString());
        }catch(e) {
            console.log(e);
        }
        repl();
    });
}

const main = repl;

main();
