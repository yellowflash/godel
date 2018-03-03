class Errors {}

class ParseError extends Errors {
    constructor(expected, line, column) {
        super();
        this.expected = expected;
        this.line = line;
        this.column = column;
    }

    toString() {
        return "Expected " + this.expected + " at line " + this.line + " column " + this.column;
    }
}

class ArgumentTypeDontMatch extends Errors {
    constructor(fn, fntype, arg, argType) {
        super()
        this.fn = fn;
        this.fntype = fntype;
        this.arg = arg;
        this.argType = argType;
    }

    toString() {
        return "Expected function that takes argument '" + this.arg + 
               "' of type, '" + this.argType + "' but found '" + this.fn +
               "' of type, '" + this.fntype + "'";
    }
}

class NotAFunction extends Errors {
    constructor(left, arg, argType) {
        super();
        this.left = left;
        this.arg = arg;
        this.argType = argType;
    }

    toString() {
        return "Expected function that takes argument '" + this.arg +
               "' of type, '" + this.argType + "' but found '" + this.left + "'";
    }
}

class UndefinedVariable extends Errors {
    constructor(variable) {
        super();
        this.variable = variable;
    }

    toString() {
        return "Variable '" + this.variable + "' is undefined.";
    }
}

class TypesDontMatch extends Errors {
    constructor(name, expected, found, value) {
        super();
        this.name = name;
        this.expected = expected;
        this.found = found;
        this.value = value
    }

    toString() {
        return "Expected an expression of type '" + this.expected + 
        "' but found '" + this.value + 
        "' of type '" + this.found + 
        " in the definition of '" + this.name + "'";
    }
}

module.exports = {
    ParseError: ParseError,
    ArgumentTypeDontMatch: ArgumentTypeDontMatch, 
    NotAFunction: NotAFunction,
    UndefinedVariable: UndefinedVariable,
    TypesDontMatch: TypesDontMatch};