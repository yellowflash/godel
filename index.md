---
layout: page
---

Godel is an attempt to fix the problems I am facing while self learning mathematics. It's an attempt to define math books which are interactive and allows readers to solve problems which aren't just choose one of the options. It has a proof-checker which allows readers to build proofs for the exercises in the books and also verify that the reasoning is right.

The important piece in here is the proof checker. Godel's proof checker uses "Calculus of constructions" as the base. Godel has 2 mini languages within it.
One is the expression language and the other is the definition language.

Expression language
-------------------

There are 5 different kind of expressions,

-  Function definitions - `\<variable> : <type>, <body>` or alternatively `λ<variable> : <type>`, body
-  Functions have type - `\/<variable> : <type>, <body>` or alternatively `∀<variable> : <type>`, body
-  Application - Normal juxtapositioning the function and the argument means its application.
-  Variables - Any sequence of alpha-numeric characters following an alphabet is a variable.
-  Star - A special expression could be called Proposition/Kind. (TODO: Expand this notion to take in universe parameters.)

Every expression in Godel has a type and even types have type.

Definition language
-------------------
he definition language allows us to build definitions/theorems/lemmas and prove them or take some of them as axioms. Constructively a proof is a program satisfying a type. So the types tell us what we are proving and the program is really a proof.

We could define definitions like this, 

`definition <name> : <type> = <expression>.` 

or 

`definition <name> = <expression>.`

Godel definitions don't distinguish between definition / theorem / lemma, they are just syntactic sugar over the expression language, where as the axiom is a definition of an object of a type for which we don't have proof. Axioms are defined like this 

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

Godel repl can be run as (expressions) `nodejs js/Main.js`

And to run a program (defintions) `nodejs js/Main.js <files>`