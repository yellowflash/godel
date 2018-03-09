const Errors = require("./Errors.js");
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
        if(this.type == null || this.type.eval(ctx)[0].alphaEquiv(exprType)) {
            return ctx.add(this.name, [exprValue, exprType]);
        }
        throw new Errors.TypesDontMatch(this.name, this.type, exprType, exprValue);
    }
}

class Axiom extends Statement {
    constructor(name, type, index) {
        super();
        this.name = name;
        this.type = type;
        this.index = index;
    }

    eval(ctx) {
        return ctx.add(this.name, [new Lang.Var(this.name, this.index), this.type.eval(ctx)[0]]);
    }
}

module.exports = {Program: Program, Definition: Definition, Axiom: Axiom};