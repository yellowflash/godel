module Godel.Expr where

import Control.Alt ((<|>))
import Control.Lazy (fix)
import Control.Monad.Except (ExceptT, except, runExceptT)
import Control.Monad.State (StateT, evalStateT, get, lift, put)
import Control.Monad.Trampoline (Trampoline(), runTrampoline)
import Data.Either (Either(..))
import Data.List (List(..), drop, (!!), (:))
import Data.List.NonEmpty (NonEmptyList(..))
import Data.Map (Map, empty, insert, lookup)
import Data.Map as Map
import Data.Maybe (maybe)
import Data.NonEmpty (foldl1)
import Prelude (class Show, Unit, bind, discard, identity, negate, otherwise, pure, show, unit, ($), (+), (-), (<<<), (<>), (==), (<=), (>>=))
import Text.Parsing.StringParser (ParseError(..), Parser, fail, runParser)
import Text.Parsing.StringParser.CodePoints (regex, skipSpaces)
import Text.Parsing.StringParser.CodeUnits (string)
import Text.Parsing.StringParser.Combinators (between, optionMaybe, sepBy1)

data Expr = Star | 
            Var String Int | 
            TypedHole Int Expr |
            Lambda Boolean String Expr Expr | 
            Pi Boolean String Expr Expr | 
            App Expr Expr

instance showExpr :: Show Expr where
    show Star = "*"
    show (Var name i) = name
    show (TypedHole i _) = "?" <> (show i)
    show (Lambda true pname typ body) = "{" <> pname <>": " <> (show typ) <> "} => " <> (show body)
    show (Lambda false pname typ body) = "(" <> pname <>": " <> (show typ) <> ") => " <> (show body)
    show (Pi true pname typ body) = "forall {" <> pname <>": " <> (show typ) <> "}, " <> (show body)
    show (Pi false pname typ body) = "forall " <> pname <>": " <> (show typ) <> ", " <> (show body)
    show (App fn arg) = "(" <> (show fn) <> " " <> (show arg) <> ")"
    

-- | Basic operations on DeBruijn indices
shift :: Int -> Expr -> Expr
shift = shift' 0 where
    shift' k n Star = Star
    shift' k n (Var name k') | k <= k' = Var name (k' + n)
                             | otherwise = Var name k'
    shift' k n (TypedHole k' t) = TypedHole k' t
    shift' k n (Lambda implicit pname ptype body) = Lambda implicit pname (shift' k n ptype) (shift' (k + 1) n body)
    shift' k n (Pi implicit pname ptype body) = Pi implicit pname (shift' k n ptype) (shift' (k + 1) n body)
    shift' k n (App fn arg) = App (shift' k n fn) (shift' k n arg)

unshift :: Int -> Expr -> Expr
unshift = shift <<< negate


-- | Evaluation context
type Judgement = { value :: Expr, typ :: Expr }
type Context = { bindings :: List Judgement, nextHole :: Int, unionTree :: Map Int Judgement }
type Error = String

emptyContext :: Context
emptyContext = {bindings: Nil, nextHole: 0, unionTree: empty}

shiftJudgement :: Int -> Judgement -> Judgement
shiftJudgement n {value : value, typ : typ} = {value : (shift n value), typ : (shift n typ)}

unshiftJudgement :: Int -> Judgement -> Judgement
unshiftJudgement = shiftJudgement <<< negate

-- | Stateful operations in the context
type Op = StateT Context (ExceptT Error Trampoline)

return :: forall a. a -> Op a
return = lift <<< except <<< Right

throw :: forall a. String -> Op a
throw = lift <<< except <<< Left

add :: Judgement -> Op Unit
add judgement = do
  ctx <- get
  put $ ctx { bindings = judgement : ctx.bindings }

at :: String -> Int -> Op Judgement
at name n = do
  ctx <- get
  maybe (throw ("Invalid variable index " <> (show n) <> " for " <> name)) (return <<< (shiftJudgement n)) $ ctx.bindings !! n

out :: Op Unit
out = do
  ctx <- get
  put $ ctx { bindings = drop 1 ctx.bindings }
  return unit

resolve :: Int -> Expr -> Op Judgement
resolve n typ = do
    ctx <- get
    return $ maybe {value : (TypedHole n typ), typ: typ} identity (lookup n ctx.unionTree)

union :: Int -> Judgement -> Op Unit
union h judgement = do
    ctx <- get
    put $ ctx { unionTree = insert h judgement ctx.unionTree }

newHole :: Expr -> Op Judgement
newHole typ = do
    ctx <- get
    put $ ctx { nextHole = ctx.nextHole + 1 }
    return {value : TypedHole ctx.nextHole typ, typ: typ}

-- | Evaluation of expressions
unify :: Expr -> Expr -> Op Unit
unify Star Star = return unit
unify (Var _ n) (Var _ m) | n == m = return unit
unify (Lambda _ _ ptype body) (Lambda _ _ ptype' body') = do
    unify ptype ptype'
    unify body body'
unify (Pi _ _ ptype body) (Pi _ _ ptype' body') = do
    unify ptype ptype'
    unify body body'
unify (App fn arg) (App fn' arg') = do
    unify fn fn'
    unify arg arg'
unify (TypedHole h t) (TypedHole h' t') | h == h' = return unit
unify (TypedHole h t) x = do
    {typ : t'} <- eval x
    unify t t'
    union h { value: x, typ: t' }
unify x (TypedHole h t) = unify (TypedHole h t) x 
unify x y = throw $ "Cannot unify " <> (show x) <> " with " <> (show y) 

apply :: Judgement -> Judgement -> Op Judgement
apply {value : fn, typ: (Pi true pname ptype bodytype)} arg = do
    implicitArg <- newHole ptype
    fn' <- apply { value : fn, typ: (Pi false pname ptype bodytype) } implicitArg
    apply fn' arg
apply {value : (Lambda _ _ ptype body)} {value: arg, typ: argtype} = do
    unify ptype argtype
    add $ shiftJudgement 1 {value: arg, typ: argtype}
    body' <- eval body
    out
    return $ unshiftJudgement 1 body'
apply {value: fn, typ: (Pi _ _ ptype body)} {value: arg, typ: argtype} = do
    unify ptype argtype
    add $ shiftJudgement 1 {value: arg, typ: argtype}
    {value: body'} <- eval body
    out
    return $ { 
        value: App fn arg, 
        typ: unshift 1 body'
    }
apply _ _ = throw "Trying to apply non function with arguments"

eval :: Expr -> Op Judgement
eval Star = return $ {value: Star, typ: Star}
eval (Var name n) = at name n
eval (TypedHole n typ) = do
    {value: v, typ: typ'} <- resolve n typ
    case v of 
        (TypedHole n' _) | n == n' -> return $ { value: TypedHole n typ', typ: typ' }
        other -> eval other
eval (Lambda implicit pname ptype body) = do
    {value : ptype'} <- eval ptype
    add $ { value: Var pname 0, typ : ptype' }
    body' <- eval body
    out
    return {
        value : Lambda implicit pname ptype' body,
        typ: Pi implicit pname ptype' body
    }
eval (Pi implicit pname ptype body) = do
    {value : ptype'} <- eval ptype
    add $ { value: Var pname 0, typ : ptype' }
    body' <- eval body
    out
    return {
        value : Pi implicit pname ptype' body,
        typ: Star
    }
eval (App fn arg) = do
    fn' <- eval fn
    arg' <- eval arg
    apply fn' arg'

-- | Parser for expression.
type ParserContext = { indexLookup :: Map String Int, depth :: Int }
type Param = {implicit :: Boolean, pname :: String, ptype :: Expr}

token :: String -> Parser String
token = (between skipSpaces skipSpaces) <<< string

keyword :: String -> Boolean
keyword "forall" = true
keyword "fn" = true
keyword _ = false

identifier :: Parser String
identifier = do 
    name <- regex "[a-zA-Z][a-zA-Z0-9]*"
    if (keyword name) then fail ("Reserved " <> name) else pure name 

param :: ParserContext -> Parser Param
param ctx =  nametyp <|> imp <|> between (token "(") (token ")") nametyp where
    imp :: Parser Param
    imp = do 
        p <- between (token "{") (token "}") nametyp
        pure $ p {implicit = true}
    nametyp :: Parser Param
    nametyp = do
        name <- identifier
        _ <- token ":"
        typ <- exp ctx
        pure {implicit: false, pname: name, ptype: typ}

lambda :: ParserContext -> Parser Expr
lambda ctx = do
  _ <- token "fn"
  p <- param ctx
  _ <- token "=>"
  body <- exp ctx {indexLookup = insert p.pname ctx.depth ctx.indexLookup, depth = ctx.depth + 1}
  pure $ Lambda p.implicit p.pname p.ptype body
  
pi :: ParserContext -> Parser Expr
pi ctx = do
  _ <- token "forall"
  p <- param ctx
  _ <- token ","
  body <- exp ctx {indexLookup = insert p.pname ctx.depth ctx.indexLookup, depth = ctx.depth + 1}
  pure $ Pi p.implicit p.pname p.ptype body

star :: Parser Expr
star = do 
    _ <- token "*"
    pure Star

variable :: ParserContext -> Parser Expr
variable ctx = do
  name <- identifier
  maybe (fail ("Undefined variable " <> name)) (pure <<< (Var name) <<< ((-) (ctx.depth - 1))) $ lookup name ctx.indexLookup

exp :: ParserContext -> Parser Expr
exp ctx = fix (\e -> do 
    (NonEmptyList exps) <- sepBy1 (star <|> pi ctx <|> lambda ctx <|> variable ctx <|> between (token "(") (token ")") e) skipSpaces
    pure $ foldl1 App exps)

runEval :: Expr -> Either Error Judgement
runEval expr = runTrampoline $ runExceptT $ evalStateT (eval expr) { bindings: Nil, nextHole: 0, unionTree: Map.empty}

run :: String -> Either Error Judgement
run e = case runParser (exp {indexLookup: Map.empty, depth: 0}) e of
            (Left (ParseError err)) -> Left err
            (Right expr) -> runEval expr

-- | Parser for programs.
definition :: ParserContext -> Parser Expr
definition ctx = do
    _ <- (token "definition") <|> (token "theorem") <|> (token "lemma")
    name <- identifier
    o <- optionMaybe ((token ":") >>= (\_ -> exp ctx))
    _ <- (token ":=")
    e <- exp ctx
    _ <- (token ".")
    more <- optionMaybe (prog ctx {indexLookup = insert name ctx.depth ctx.indexLookup, depth = ctx.depth + 1})
    pure $ App (maybe (Lambda true (name <> "$type") Star (Lambda false name (Var (name <> "$type") 0) (body more 1))) (\typ -> (Lambda false name typ (body more 0))) o) e where
      body more s = maybe (Var "Qed" 0) (shift s) more

axiom :: ParserContext -> Parser Expr
axiom ctx = do
    _ <- (token "axiom")
    name <- identifier
    _ <- (token ":")
    typ <- exp ctx
    _ <- (token ".")
    more <- (prog ctx {indexLookup = insert name ctx.depth ctx.indexLookup, depth = ctx.depth + 1}) <|>  pure (Var "Qed" 0)
    pure (Lambda false name typ  more)

prog :: ParserContext -> Parser Expr
prog ctx = (definition ctx) <|> (axiom ctx)

runProg :: String -> String
runProg p = case runParser (prog {indexLookup: Map.empty, depth: 0}) p of
                (Left (ParseError e)) -> e
                (Right expr) -> case runEval expr of
                    (Left e) -> (show expr) <> " " <> e
                    (Right j) -> (show j)