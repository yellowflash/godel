const Lang = require("./Lang.js");
const P = require("./lib/Parsimmon.js");

const identifier = P.regex(/[a-zA-Z][a-zA-Z0-9]*/);

const expression = P.lazy(() => P.alt(paranthesized, star, pi, lambda, variable)
                                 .trim(P.optWhitespace)
                                 .many()
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


const evaluate = (str) => expression.parse(str).value.eval(Lang.Ctx.empty());

module.exports = {parse: expression.parse, evaluate: evaluate};
