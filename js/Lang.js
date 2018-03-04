const Errors = require("./Errors.js")

class Ctx {
    constructor(lookup) {
        this.lookup = lookup;
    }
    
    add(key, value) {
        const self = this;
        return new Ctx(function (lkey){
            if(key === lkey) {
                return value;
            } else {
               return self.lookup(lkey);
            }
        })
    }
    
    static empty() {
        return new Ctx((key) => null);
    }
}

class Expr {
    eval(ctx) {
        throw "Not implemented";
    }
    alphaConvertsTo(another, ctx) {
        throw "Not implemented";
    }
}

class Star extends Expr {
    constructor() {super();}
    eval(ctx) {
        return [this, this];
    }
    alphaConvertsTo(another, ctx) {
        return another instanceof Star;
    }
    toString() {
        return "*";
    }
}

class Var extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }
    
    eval(ctx) {
        const value = ctx.lookup(this.name);
        if(!value) throw new Errors.UndefinedVariable(value);
        return value;
    }
    
    alphaConvertsTo(another, ctx) {
        const renamed = ctx.lookup(this.name) || this.name;
        return (another instanceof Var) && (renamed == another.name);
    }
    
    toString() {
        return this.name;
    }
}

class Lambda extends Expr {
    constructor(paramName, paramType, body) {
        super();
        this.paramName = paramName;
        this.paramType = paramType;
        this.body = body;
    }
    
    eval(ctx) {
        const [pType, pTypeType] = this.paramType.eval(ctx);
        const [bodyVal, bodyType] = this.body.eval(ctx.add(this.paramName, [new Var(this.paramName), pType]));
                                            
        return [new Lambda(this.paramName, pType, bodyVal),
                new Pi(this.paramName, pType, bodyType)];
    }
    
    alphaConvertsTo(another, ctx) {
        return (another instanceof Lambda) && 
            this.paramType.alphaConvertsTo(another.paramType, ctx) && 
            this.body.alphaConvertsTo(another.body, ctx.add(this.paramName, another.paramName))
    }
    
    toString() {
        const typed = this.paramType instanceof Var || this.paramType instanceof Star ?  
            this.paramType : 
            "(" + this.paramType + ")";
        return "λ" + this.paramName + ": " + typed + ", " + this.body;
    }
}

class Pi extends Expr {
    constructor(paramName, paramType, body) {
        super();
        this.paramName = paramName;
        this.paramType = paramType;
        this.body = body;
    }
    
    eval(ctx) {
        const [pType, pTypeType] = this.paramType.eval(ctx);
        const [bodyVal, bodyType] = this.body.eval(ctx.add(this.paramName, [new Var(this.paramName), pType]));
                                                                  
        return [new Pi(this.paramName, pType, bodyVal), 
                new Star()];
    }
    
    alphaConvertsTo(another, ctx) {
        return (another instanceof Pi) && 
            this.paramType.alphaConvertsTo(another.paramType, ctx) && 
            this.body.alphaConvertsTo(another.body, ctx.add(this.paramName, another.paramName))
    }
    
    toString() {
        const typed = this.paramType instanceof Var || this.paramType instanceof Star ?  
                        this.paramType : 
                        "(" + this.paramType + ")";
        return "∀" + this.paramName + ": " + typed + ", " + this.body;
    }

}

class App extends Expr {
    constructor(fn, arg) {
        super();
        this.fn = fn;
        this.arg = arg;
    }
    
    eval(ctx) {
        const [argValue, argType] = this.arg.eval(ctx);
        const [fnValue, fnType] = this.fn.eval(ctx);
        if(fnType instanceof Pi) {
            if(fnType.paramType.alphaConvertsTo(argType, Ctx.empty())) {
                if(this.fn instanceof Lambda) {
                    return this.fn.body.eval(ctx.add(this.fn.paramName, [argValue, argType]))[0].eval(ctx);
                } else {
                    return [
                        new App(fnValue, argValue) ,
                        fnType.body.eval(ctx.add(this.fn.paramName, [argValue, argType]))[0]];
                }
            } else {
                throw new Errors.ArgumentTypeDontMatch(fnValue, fnType, argValue, argType);
            }
        } else {
            throw new Errors.NotAFunction(fnValue, argValue, argType);
        }
    }
    
    alphaConvertsTo(another, ctx) {
        return (another instanceof App) && 
            this.fn.alphaConvertsTo(another.fn, ctx) &&
            this.arg.alphaConvertsTo(another.arg, ctx)
    }
    
    toString() {
        return "(" + this.fn + " " + this.arg + ")";
    }
}

module.exports = {Ctx: Ctx, Star: Star, Var: Var, Lambda: Lambda, Pi: Pi, App: App};    