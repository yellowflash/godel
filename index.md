---
layout: page
---

Godel is an attempt to fix the problems I have been facing while learning mathematics. It's an attempt to define math books which are interactive and allows readers to solve problems which aren't just choose one of the options. More importantly it should check if my proofs are right. So as a first step, Godel has a proof assistant which allows users to build proofs for the exercises in it. 

Godel proof assistant is built on the foundations of *Calculus of construction*. It is a programming language with very strict and powerful type system. Godel proof language contains two mini languages, one is the *Expression Language* which is sort of the kernel of Godel proof assistant and there is a *Defintion Language* which is useful to clearly state the mathematical structures and theorems.

Expression language
-------------------

In Godel, every expression has *Type* associated with it and *Types* are first class entities, ie., You can define function which takes and gives out Types as result. One of the basic constructs in Godel is a function. Arguments to the function has to be annotated with a type, while the body of the function's type is infered. Godel is purely functional language, there is no notion of statements/actions, so the body of a function is a single expression. One of the simplest function defintion looks like this

~~~~
λA:*, λx:A, x
~~~~

The above defintion is a family of identity functions. You could get a identity function of a particular type, by passing the type as the first argument to it. So the function defined above take a type `A` and takes a value `x` of type `A` and gives back `x` itself. But what is the type of the function. Its defined like this.

~~~~
∀A:*, ∀x:A, A
~~~~

Its read like *for all type `A` forall `x` of type `A` it returns `A`*. Godel is dependent typed, ie., the value of the argument could in essence define what the body's type is. The above function could never be expressed in a language which treats type as first class but doesn't have the dependent types built in. Since the type of the identity function it returns is *dependent* on the *value* of the argument to the function.

We could ask what is the *type* of the above type. We take for the simplicity as a kind `*`. Which denotes the type of the types, which is exactly what we did before in the definition of family of identity functions.

In order to make the functions useful, we should be able to apply the functions to specific arguments. Normal juxta-positioning the argument and functions means a function application. Like this,

~~~~
λA:*, λx:A, (λy: A, y) x
~~~~

Paranthesis above is used to disambiguate, everything associates to right in Godel. Thus the following will not type check

~~~~
λA:*, λx:A, λy: A, y x
~~~~

as that is equivalent to 

~~~~
λA:*, λx:A, λy: A, (y x)
~~~~

Since, the `y` is not a function which takes `A`. Though you could ask we don't know the type of what type `A` stand for yet. But we definitely can be sure that `A` cannot be a function which takes `A` itself as a parameter, other wise the `A` has to be infintely long. So in short, Godel disallows application of arguments to anything which it clearly dont know as function.

The entire syntax of Godel's expression language could be summarized as

-  Function definitions `\<variable> : <type>, <body>` or alternatively `λ<variable> : <type>, body`
-  Function types (Pi) - `\/<variable> : <type>, <body>` or alternatively `∀<variable> : <type>, body`
-  Application - Normal juxtapositioning the function and the argument means its application.
-  Variables - Any sequence of alpha-numeric characters following an alphabet is a variable.
-  Star - A special expression could be called Proposition/Kind. (TODO: Expand this notion to take in universe parameters.)

Definition language
-------------------
The definition language allows us to build definitions/theorems/lemmas and prove them or take some of them as axioms. Constructively a proof is a program satisfying a type. So the types tell us what we are proving and the program is really a proof.

We could define definitions like this, 
~~~~
definition <name> : <type> = <expression>.
~~~~

or 

~~~~
definition <name> = <expression>.
~~~~

Godel definitions don't distinguish between definition / theorem / lemma, they are just syntactic sugar over the expression language, where as the axiom is a definition of an object of a type for which we don't have proof. Axioms are defined like this 

~~~~
axiom <name> : <type>.
~~~~

Note that axioms don't have a body/expression satisfying the type.

Examples
--------

Tuples can be defined like this.

~~~~
definition tuple = λA:*, λB:*, λa:A, λb:B, λC:*, λs:(∀a:A, ∀b: B, C), ((s a) b).
~~~~

Some of the basic propositions can be shown true by exhibiting a program with that type, as follows.

~~~~
lemma s : (∀A:*, ∀B:*, ∀C:*, ∀f:(∀a:A, ∀b:B, C), ∀g:(∀a:A, B), (∀a:A, C)) = λA:*, λB:*, λC:*, λf:(∀a:A, ∀b:B, C), λg:(∀a:A, B), (λa:A, ((f a) (g a))).
~~~~

Running
-------

Godel repl can be run as (expressions) 
~~~~
nodejs js/Main.js
~~~~

And to run a program (defintions) 

~~~~
nodejs js/Main.js <files>
~~~~