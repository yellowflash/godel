const Lang = require("./Lang.js");
const DefLang = require("./DefLang.js");
const Errors = require("./Errors.js");
const Immutable = require("./Immutable.js")
const P = require("./lib/Parsimmon.js");

P.opt = (parser) => P.alt(parser, P.succeed(null)) 

class ParseContext {
    constructor(depth, map) {
        this.depth = depth;
        this.map = map;
    }

    add(name) {
        return new ParseContext(this.depth + 1, this.map.add(name, this.depth));
    }

    lookup(name) {
        const result = this.map.lookup(name)
        if(result == null) throw new Errors.UndefinedVariable(name);
        return this.depth - 1 - result;
    }

    static empty() {
        return new ParseContext(0, Immutable.Map.empty());
    }
}


const L = {
    Identifier: P.regex(/[a-zA-Z][a-zA-Z0-9-_]*/).desc("Identifier").trim(P.optWhitespace),
    LambdaSym: P.alt(P.string("\\"), P.string("λ")).trim(P.optWhitespace),
    PiSym: P.alt(P.string("\\/"), P.string("∀")).trim(P.optWhitespace),
    Colon:  P.string(":").trim(P.optWhitespace),
    DefSynonyms:  P.alt(P.string("definition"), P.string("theorem"), P.string("lemma"), P.string("example")).trim(P.optWhitespace),
    AxiomSynonyms: P.string("axiom").trim(P.optWhitespace),
    Equals: P.string("=").trim(P.optWhitespace),
    FullStop: P.string(".").trim(P.optWhitespace),
    Comma: P.string(",").trim(P.optWhitespace),
    OpenParan: P.string("(").trim(P.optWhitespace),
    ClosedParan: P.string(")").trim(P.optWhitespace)
}


const Typed = (ctx) => P.lazy(() => P.seq(L.Identifier, L.Colon , Expression(ctx)).map(([name, colon, type]) => [name, type]));
const Star = P.string("*").map(() => new Lang.Star());
const Var = (ctx) => L.Identifier.map((name) => new Lang.Var(name, ctx.lookup(name)));

const Lambda = (ctx) => 
    P.seq(L.LambdaSym, Typed(ctx).skip(L.Comma))
        .chain(([sym, [name, type]]) => 
            Expression(ctx.add(name)).map((body) => new Lang.Lambda(name, type, body)));

const Pi = (ctx) => 
    P.seq(L.PiSym, Typed(ctx).skip(L.Comma))
        .chain(([sym, [name, type]]) => 
            Expression(ctx.add(name)).map((body) => new Lang.Pi(name, type, body)));

const Expression = (ctx) => P.lazy(() =>
    P.alt(Star, Expression(ctx).wrap(L.OpenParan, L.ClosedParan), Lambda(ctx), Pi(ctx), Var(ctx))
            .trim(P.optWhitespace)
            .atLeast(1)
            .map((exps) => exps.reduce((fn, arg) => new Lang.App(fn, arg))));

const Definition = (ctx) => 
    L.DefSynonyms.then(P.seq(L.Identifier, P.opt(L.Colon.then(Expression(ctx))), L.Equals.then(Expression(ctx))))
        .skip(L.FullStop) 
        .map(([name, type, exp]) => new DefLang.Definition(name, type, exp));

const Axiom = (ctx) => 
    L.AxiomSynonyms.then(P.seq(L.Identifier, P.opt(L.Colon.then(Expression(ctx))))) 
        .skip(L.FullStop)
        .map(([name, type, exp]) => new DefLang.Axiom(name, exp, this.depth));

const Block = (ctx) => 
    P.alt(Axiom(ctx), Definition(ctx))
        .chain((def) => {
            return P.alt(
                    P.eof.map(Immutable.List.empty), 
                    Block(ctx.add(def.name))).map((definitions) => definitions.add(def));
        });

const Program = Block(ParseContext.empty()).map((definitions) => new DefLang.Program(definitions.toArray()));

const evaluate = (str) => {
    const expr = Expression(ParseContext.empty()).parse(str);
    return expr.value.eval(Lang.Ctx.empty());
};

const run = (content) => {
    const prog = Program.parse(content);
    if(prog.status) {
        return prog.value.eval(Lang.Ctx.empty());
    } else {
        throw new Errors.ParseError(prog.expected, prog.index.line, prog.index.column);
    }
}

module.exports = {
    evaluate: evaluate,
    run: run};
