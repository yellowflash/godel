const Parser = require("./Parser.js");
const Lang = require("./Lang.js");
const Errors = require("./Errors.js");
const readline = require("readline");
const process = require("process")
const fs = require("fs")

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
            console.log(e.toString());
        }
        repl();
    });
}

const run = function(files) {
    const runInternal = (files, index) => {
        if(files.length == index) {
            console.log("QED");
            process.exit(0);
        }
        fs.readFile(files[index], 'utf8', (err, content) => {
            if(err){
                console.log(err);
            } else {
                try {
                    Parser.run(content);
                    runInternal(files, index + 1);
                } catch(e) {
                    if(e instanceof Errors.Errors) {
                        console.log(e.toString());
                    } else {
                        console.log(e);
                    }
                    process.exit(1);
                }
            }
        });
    }
    runInternal(files, 2);
} 


const main = () => {
    if(process.argv.length > 2) {
        run(process.argv);
    } else {
        repl()
    }
}

main();
