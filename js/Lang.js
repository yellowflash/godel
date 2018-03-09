const Errors = require("./Errors.js");

class Ctx {
    constructor(lookup) {
        this.lookup = lookup;
    }

    add(name, value) {
        return new Ctx((lname, index) => {
            if(index == 0) return value;
            const result = this.lookup(lname, index - 1);
            return result == null ? null : result.map((e) => e.shift(0));
        });
    }

    static empty() {
        return new Ctx((name, index) => null);
    }
}

class Expression {
    shift(n) {
        throw "Not implemented";
    }

    unshift(n) {
        throw "Not implemented";
    }

    eval(ctx) {
        throw "Not implemented";
    }

    alphaEquiv(another) {
        throw "Not implemented";
    }

    toString() {
        throw "Not implemented";
    }
}

class Star extends Expression {
    constructor() {
        super();
    }

    shift() {
        return this;
    }

    unshift() {
        return this;
    }

    eval(ctx) {
        return [this, this];
    }

    alphaEquiv(another) {
        return another instanceof Star;
    }

    toString() {
        return "*";
    }
}

class Var extends Expression {
    constructor(name, index) {
        super();
        this.name = name;
        this.index = index;
    }

    shift(n) {
        return new Var(this.name, this.index >= n ? this.index + 1 : this.index);
    }

    unshift(n) {
        return new Var(this.name, this.index >= n ? this.index - 1 : this.index);
    }

    eval(ctx) {
        const value = ctx.lookup(this.name, this.index);
        if(!value) throw new Errors.UndefinedVariable(this.name);
        return value;
    }

    alphaEquiv(another) {
        return another instanceof Var && this.index == another.index;
    }

    toString() {
        return this.name;
    }
}

class Lambda extends Expression {
    constructor(paramName, paramType, body) {
        super();
        this.paramName = paramName;
        this.paramType = paramType;
        this.body = body;
    }

    shift(n) {
        return new Lambda(this.paramName, this.paramType.shift(n), this.body.shift(n + 1));
    }

    unshift(n) {
        return new Lambda(this.paramName, this.paramType.unshift(n), this.body.unshift(n + 1));
    }

    eval(ctx) {
        const [pType, pTypeType] = this.paramType.eval(ctx);
        const [bodyVal, bodyType] = this.body.eval(ctx.add(this.paramName, [new Var(this.paramName, 0), pType]));

        return [new Lambda(this.paramName, pType, bodyVal),
                new Pi(this.paramName, pType, bodyType)];
    }

    alphaEquiv(another) {
        return another instanceof Lambda && this.paramType.alphaEquiv(another.paramType) && this.body.alphaEquiv(another.body);
    }

    toString() {
        const typed = this.paramType instanceof Var || this.paramType instanceof Star ?  
            this.paramType : 
            "(" + this.paramType + ")";
        return "λ" + this.paramName + ": " + typed + ", " + this.body;
    }
}

class Pi extends Expression {
    constructor(paramName, paramType, body) {
        super();
        this.paramName = paramName;
        this.paramType = paramType;
        this.body = body;
    }

    shift(n) {
        return new Pi(this.paramName, this.paramType.shift(n), this.body.shift(n + 1));
    }

    unshift(n) {
        return new Pi(this.paramName, this.paramType.unshift(n), this.body.unshift(n + 1));
    }

    eval(ctx) {
        const [pType, pTypeType] = this.paramType.eval(ctx);
        const [bodyVal, bodyType] = this.body.eval(ctx.add(this.paramName, [new Var(this.paramName, 0), pType]));

        return [new Pi(this.paramName, pType, bodyVal),
                new Star()];
    }

    alphaEquiv(another) {
        return another instanceof Pi && this.paramType.alphaEquiv(another.paramType) && this.body.alphaEquiv(another.body);
    }

    toString() {
        const typed = this.paramType instanceof Var || this.paramType instanceof Star ?  
                        this.paramType : 
                        "(" + this.paramType + ")";
        return "∀" + this.paramName + ": " + typed + ", " + this.body;
    }
}

class App extends Expression {
    constructor(fn, arg) {
        super();
        this.fn = fn;
        this.arg = arg;
    }

    shift(n) {
        return new App(fn.shift(n), arg.shift(n));
    }

    unshift(n) {
        return new App(fn.unshift(n), arg.unshift(n));
    }

    eval(ctx) {
        const [fnValue, fnType] = this.fn.eval(ctx);
        const [argValue, argType] = this.arg.eval(ctx);

        if(fnType instanceof Pi) {
            if(fnType.paramType.alphaEquiv(argType)) {
                if(fnValue instanceof Lambda) {
                    return fnValue.body.eval(ctx.add(this.paramName, [argValue.shift(0), argType.shift(0)]))[0].unshift(1).eval(ctx);
                } else {
                    return [new App(fnValue, argValue),
                            fnType.body.eval(ctx.add(this.paramName, [argValue.shift(0), argType.shift(0)]))[0].unshift(1)]
                }
            } else {
                throw new Errors.ArgumentTypeDontMatch(fnValue, fnType, argValue, argType);
            }
        } else {
            throw new Errors.NotAFunction(fnValue, fnType, argValue, argType);
        }
    }

    alphaEquiv(another) {
        return another instanceof App && this.fn.alphaEquiv(another.fn) && this.arg.alphaEquiv(another.arg);
    }

    toString() {
        return "(" + this.fn + " " + this.arg + ")";
    }
}

module.exports = {Ctx: Ctx, Star: Star, Var: Var, Lambda: Lambda, Pi: Pi, App: App};