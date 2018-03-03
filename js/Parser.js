const Lang = require("./Lang.js");
const DefLang = require("./DefLang.js");
const Errors = require("./Errors.js");
const P = require("./lib/Parsimmon.js");

P.opt = (parser) => P.alt(parser, P.succeed(null)) 

const identifier = P.regex(/[a-zA-Z][a-zA-Z0-9]*/).trim(P.optWhitespace);

const expression = P.lazy(() => P.alt(paranthesized, star, pi, lambda, variable)
                                 .trim(P.optWhitespace)
                                 .atLeast(1)
                                 .map((exps) => exps.reduce((a, b) => new Lang.App(a, b))));

const paranthesized = expression.wrap(P.string("("), P.string(")")).trim(P.optWhitespace);

const star = P.alt(P.string("*"), P.string("★")).map((sym) => new Lang.Star());
const variable = identifier.map((name) => new Lang.Var(name)).trim(P.optWhitespace);
const typedParam = P.seq(identifier, P.string(":"), expression).map(([name, colon, typ]) => [name, typ]);

const lambda = P.seq(P.alt(P.string("\\"), P.string("λ")).trim(P.optWhitespace), 
                    typedParam, 
                    P.string(","), 
                    expression).map(([sym, [pname, ptype], comma, body]) => new Lang.Lambda(pname, ptype, body));

const pi = P.seq(P.alt(P.string("\\/"), P.string("∀")).trim(P.optWhitespace), 
                    typedParam, 
                    P.string(","), 
                    expression).map(([sym, [pname, ptype], comma, body]) => new Lang.Pi(pname, ptype, body));

const definition = 
    P.alt(P.string("definition"), P.string("theorem"), P.string("lemma"), P.string("example")).then(P.seq(
        identifier, 
        P.opt(P.string(":").then(expression)), 
        P.string("=").then(expression), 
        P.string("."))).map(([name, type, body, fullstop]) => new DefLang.Definition(name, type, body));

const axiom = P.string("axiom").then(P.seq(
    identifier,
    P.string(":").then(expression),
    P.string("."))).map(([name, type, fullstop]) => new DefLang.Axiom(name, type));


const program = P.alt(definition, axiom).many().map((definitions) => new DefLang.Program(definitions));

const evaluate = (str) => {
    const expr = expression.parse(str);
    console.log(expr);
    return expr.value.eval(Lang.Ctx.empty());
};

const run = (content) => {
    const prog = program.parse(content)
    if(prog.status) {
        return prog.value.eval(Lang.Ctx.empty());
    } else {
        throw new Errors.ParseError(prog.expected, prog.index.line, prog.index.column);
    }
}

module.exports = {
    parse: expression.parse, 
    evaluate: evaluate,
    run: run};
