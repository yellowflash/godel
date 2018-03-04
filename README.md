Godel
-----

Godel is an attempt to build mathematics books which are interactive. It is based on calculus of constructions, and lets the users to solve the exercises by writing programs in it.

Syntax
------

Godel has 2 different small internal language, an expression language and definition language. Every expression in Godel has a type. Even types have types. There are 5 different kind of expressions,
1. Function definitions - `\<variable> : <type>, <body>` or alternatively `λ<variable> : <type>, body`
2. Functions have type - `\/<variable> : <type>, <body>` or alternatively `∀<variable> : <type>, body`
3. Application - Normal juxtapositioning the function and the argument means its application.
4. Variables - Any sequence of alpha-numeric characters following an alphabet is a variable.
5. Star - A special expression could be called Proposition/Kind. (TODO: Expand this notion to take in universe parameters.)

And the definition language allows us to build definitions/theorems/lemmas and prove them or take some of them as axioms. Constructively a proof is a program satisfying a type. So the types tell us what we are proving and the program is really a proof.

We could define definitions like this,
`definition <name> : <type> = <expression>.`
or
`definition <name> = <expression>.`

Godel definitions don't distinguish between `definition` / `theorem` / `lemma`, they are just syntactic sugar over the expression language. Where as the `axiom` is a defintion of an object of a type for which we don't have proof. Axioms are defined like this
`axiom <name> : <type>.`

Note that axioms don't have a body/expression satisfying the type.

Examples
-------- 

Tuples can be defined like this.

`definition tuple = λA:*, λB:*, λa:A, λb:B, λC:*, λs:(∀a:A, ∀b: B, C), ((s a) b).`

Some of the basic propositions can be shown true by exhibiting a program with that type, as follows.

`lemma s : (∀A:*, ∀B:*, ∀C:*, ∀f:(∀a:A, ∀b:B, C), ∀g:(∀a:A, B), (∀a:A, C)) = λA:*, λB:*, λC:*, λf:(∀a:A, ∀b:B, C), λg:(∀a:A, B), (λa:A, ((f a) (g a))).`

Running
-------

Godel repl can be run as (expressions)
`nodejs js/Main.js` 

And to run a program (defintions)
`nodejs js/Main.js <files>`