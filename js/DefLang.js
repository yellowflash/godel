const Errors = require("./DefLang.js");
const Lang = require("./Lang.js");

class Program {
    constructor(definitions) {
        this.definitions = definitions;
    }

    eval(ctx) {
        return this.definitions.reduce((ctx, definition) => definition.eval(ctx), ctx);
    }
}

class Statement {
    eval(ctx) {
        throw "Not implemented";
    }
}

class Definition extends Statement {
    constructor(name, type, expr) {
        super();
        this.name = name;
        this.type = type;
        this.expr = expr;
    }

    eval(ctx) {
        const [exprValue, exprType] = this.expr.eval(ctx);
        if(this.type == null || this.type.eval(ctx)[0].alphaConvertsTo(exprType, Lang.Ctx.empty())) {
            return ctx.add(this.name, [exprValue, exprType]);
        }
        throw new Errors.TypesDontMatch(this.name, this.type, exprType, exprValue);
    }
}

class Axiom extends Statement {
    constructor(name, type) {
        super();
        this.name = name;
        this.type = type;
    }

    eval(ctx) {
        return ctx.add(this.name, [new Lang.Var(this.name), this.type.eval(ctx)[0]]);
    }
}

module.exports = {Program: Program, Definition: Definition, Axiom: Axiom};