"use strict";

(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
            typeof define === 'function' && define.amd ? define(['exports'], factory) :
              (global = global || self, factory(global.lox = {}));
       })(this, (function (exports) { 'use strict';
var __export__ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Environment: () => environment_default,
    Lox: () => Lox,
    defaultErrorHandler: () => defaultErrorHandler,
    eventEmitter: () => eventEmitter_default,
    globalExpect: () => expect_default
  });

  // src/token.ts
  var Token = class {
    constructor(type, lexeme, literal, line) {
      this.type = type;
      this.lexeme = lexeme;
      this.literal = literal;
      this.line = line;
    }
    toString() {
      return this.type + " " + this.lexeme + " " + this.literal;
    }
  };
  var token_default = Token;

  // src/error.ts
  function errorHandler() {
    const errorList = [];
    let hadError = false;
    const report = (line, where, message) => {
      const msg = `[line ${line}] Error ${where} : ${message} `;
      errorList.push(msg);
      console.log(msg);
      hadError = true;
    };
    const error = (line, message) => {
      report(line, "", message);
    };
    const get = () => {
      return hadError;
    };
    const reset = () => {
      if (errorList.length > 0) {
        console.log("error list:", errorList);
      }
      hadError = false;
    };
    return {
      error,
      get,
      reset
    };
  }
  var RuntimeError = class extends Error {
    constructor(token, message) {
      super(`runtime error: ${token.toString()},message: ${message}`);
    }
  };
  var defaultErrorHandler = errorHandler();

  // src/util.ts
  function convertLiteralTypeToString(val) {
    if (val === null) {
      return "null";
    }
    if (typeof val === "string") {
      return val;
    }
    if (typeof val === "boolean") {
      return val.toString();
    }
    if (typeof val === "number") {
      return val.toString();
    }
    if (val && typeof val.toString === "function") {
      return val.toString();
    }
    return "";
  }
  function isFunction(fun) {
    return typeof fun === "function";
  }
  function isBaseCallable(call) {
    return "size" in call && "toString" in call && "call" in call && isFunction(call.size) && isFunction(call.toString) && isFunction(call.call);
  }
  function isTestEnv() {
    return false;
  }

  // src/scanner.ts
  var EMPTY_DATA = "\0";
  var _Scanner = class {
    constructor(text) {
      this.tokens = [];
      this.start = 0;
      this.current = 0;
      this.line = 1;
      this.scanTokens = () => {
        while (!this.isAtEnd()) {
          this.start = this.current;
          this.scanToken();
        }
        this.tokens.push(new token_default(40 /* EOF */, "", null, this.line));
        return this.tokens;
      };
      this.source = text;
    }
    isAtEnd() {
      return this.current >= this.source.length;
    }
    addToken(type) {
      this.addOneToken(type, null);
    }
    addOneToken(type, literal) {
      const text = this.source.substring(this.start, this.current);
      this.tokens.push(new token_default(type, text, literal, this.line));
    }
    getChar(index) {
      return this.source.charAt(index);
    }
    peek() {
      if (this.isAtEnd()) {
        return EMPTY_DATA;
      }
      return this.getChar(this.current);
    }
    peekNext() {
      if (this.current + 1 < this.source.length) {
        return this.getChar(this.current + 1);
      }
      return EMPTY_DATA;
    }
    match(expected) {
      if (this.isAtEnd()) {
        return false;
      }
      if (this.getChar(this.current) !== expected) {
        return false;
      }
      this.current++;
      return true;
    }
    advance() {
      return this.getChar(this.current++);
    }
    scanToken() {
      const c = this.advance();
      switch (c) {
        case "(":
          this.addToken(0 /* LEFT_PAREN */);
          break;
        case ")":
          this.addToken(1 /* RIGHT_PAREN */);
          break;
        case "{":
          this.addToken(2 /* lEFT_BRACE */);
          break;
        case "}":
          this.addToken(3 /* RIGHT_BRACE */);
          break;
        case ",":
          this.addToken(4 /* COMMA */);
          break;
        case ".":
          this.addToken(5 /* DOT */);
          break;
        case "-":
          this.addToken(6 /* MINUS */);
          break;
        case "+":
          this.addToken(7 /* PLUS */);
          break;
        case ";":
          this.addToken(8 /* SEMICOLON */);
          break;
        case "*":
          this.addToken(10 /* STAR */);
          break;
        case "!":
          this.addToken(this.match("=") ? 12 /* BANG_EQUAL */ : 11 /* BANG */);
          break;
        case "=":
          this.addToken(
            this.match("=") ? 14 /* EQUAL_EQUAL */ : 13 /* EQUAL */
          );
          break;
        case ">":
          this.addToken(
            this.match("=") ? 16 /* GREATER_EQUAL */ : 15 /* GREATER */
          );
          break;
        case "<":
          this.addToken(this.match("=") ? 18 /* LESS_EQUAL */ : 17 /* LESS */);
          break;
        case "/":
          if (this.match("/")) {
            while (this.peek() !== "\n" && !this.isAtEnd()) {
              this.advance();
            }
            if (isTestEnv()) {
              const text = this.source.substring(this.start, this.current);
              if (text.includes("expect:") && this.tokens.some((v) => v.type === 34 /* PRINT */)) {
                const t = text.split(":").pop() || "";
                if (t.trim()) {
                  this.tokens.push(
                    new token_default(41 /* LINE_COMMENT */, t.trim(), null, this.line)
                  );
                }
              }
            }
          } else if (this.match("*")) {
            while (!(this.peek() === "*" && this.peekNext() === "/" || this.isAtEnd())) {
              this.advance();
            }
            if (this.peekNext() !== "/") {
              defaultErrorHandler.error(
                this.line,
                "multiple line comment end error"
              );
            }
            this.advance();
            this.advance();
          } else {
            this.addToken(9 /* SLASH */);
          }
          break;
        case "|":
          if (this.match("|")) {
            this.addToken(31 /* OR */);
          } else {
            this.addToken(33 /* BIT_OR */);
          }
          break;
        case "&":
          if (this.match("&")) {
            this.addToken(30 /* AND */);
          } else {
            this.addToken(32 /* BIT_AND */);
          }
          break;
        case " ":
        case "\r":
        case "	":
          break;
        case "\n":
          this.line++;
          break;
        case '"':
          this.string();
          break;
        default:
          if (this.isDigit(c)) {
            this.number();
          } else if (this.isAlpha(c)) {
            this.identifier();
          } else {
            defaultErrorHandler.error(this.line, `Unexpected character: ${c}`);
          }
          break;
      }
    }
    string() {
      while (this.peek() !== '"' && !this.isAtEnd()) {
        if (this.peek() === "\n") {
          this.line++;
        }
        this.advance();
      }
      if (this.isAtEnd()) {
        defaultErrorHandler.error(this.line, "Unterminated string");
        return;
      }
      this.advance();
      const value = this.source.substring(this.start + 1, this.current - 1);
      this.addOneToken(20 /* STRING */, value);
    }
    number() {
      while (this.isDigit(this.peek())) {
        this.advance();
      }
      if (this.peek() === "." && this.isDigit(this.peekNext())) {
        this.advance();
        while (this.isDigit(this.peek())) {
          this.advance();
        }
      }
      const value = this.source.substring(this.start, this.current);
      this.addOneToken(21 /* NUMBER */, parseFloat(value));
    }
    identifier() {
      while (this.isAlphaNumeric(this.peek())) {
        this.advance();
      }
      const text = this.source.substring(this.start, this.current);
      const temp = _Scanner.keywordMap.get(text);
      let type = 19 /* IDENTIFIER */;
      if (temp !== void 0) {
        type = temp;
      }
      this.addToken(type);
    }
    isAlphaNumeric(c) {
      return this.isAlpha(c) || this.isDigit(c);
    }
    isAlpha(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
    }
    isDigit(char) {
      return char >= "0" && char <= "9";
    }
  };
  var Scanner = _Scanner;
  Scanner.keywordMap = /* @__PURE__ */ new Map([
    ["class", 22 /* CLASS */],
    ["else", 23 /* ELSE */],
    ["false", 24 /* FALSE */],
    ["for", 27 /* FOR */],
    ["fun", 26 /* FUN */],
    ["if", 28 /* IF */],
    ["null", 29 /* NIL */],
    ["print", 34 /* PRINT */],
    ["return", 35 /* RETURN */],
    ["super", 36 /* SUPER */],
    ["this", 37 /* THIS */],
    ["true", 25 /* TRUE */],
    ["var", 38 /* VAR */],
    ["while", 39 /* WHILE */]
  ]);
  var scanner_default = Scanner;

  // src/expression.ts
  var Expression = class {
  };
  var AssignExpression = class extends Expression {
    constructor(name, value) {
      super();
      this.name = name;
      this.value = value;
    }
    accept(visitor) {
      return visitor.visitAssignExpression(this);
    }
  };
  var BinaryExpression = class extends Expression {
    constructor(left, operator, right) {
      super();
      this.left = left;
      this.operator = operator;
      this.right = right;
    }
    accept(visitor) {
      return visitor.visitBinaryExpression(this);
    }
  };
  var CallExpression = class extends Expression {
    constructor(callee, paren, argumentList) {
      super();
      this.callee = callee;
      this.paren = paren;
      this.argumentList = argumentList;
    }
    accept(visitor) {
      return visitor.visitCallExpression(this);
    }
  };
  var GroupingExpression = class extends Expression {
    constructor(expression) {
      super();
      this.expression = expression;
    }
    accept(visitor) {
      return visitor.visitGroupingExpression(this);
    }
  };
  var LiteralExpression = class extends Expression {
    constructor(value) {
      super();
      this.value = value;
    }
    accept(visitor) {
      return visitor.visitLiteralExpression(this);
    }
  };
  var LogicalExpression = class extends Expression {
    constructor(left, operator, right) {
      super();
      this.left = left;
      this.operator = operator;
      this.right = right;
    }
    accept(visitor) {
      return visitor.visitLogicalExpression(this);
    }
  };
  var UnaryExpression = class extends Expression {
    constructor(operator, right) {
      super();
      this.operator = operator;
      this.right = right;
    }
    accept(visitor) {
      return visitor.visitUnaryExpression(this);
    }
  };
  var VariableExpression = class extends Expression {
    constructor(name) {
      super();
      this.name = name;
    }
    accept(visitor) {
      return visitor.visitVariableExpression(this);
    }
  };

  // src/statement.ts
  var Statement = class {
  };
  var BlockStatement = class extends Statement {
    constructor(statements) {
      super();
      this.statements = statements;
    }
    accept(visitor) {
      return visitor.visitBlockStatement(this);
    }
  };
  var ExpressionStatement = class extends Statement {
    constructor(expression) {
      super();
      this.expression = expression;
    }
    accept(visitor) {
      return visitor.visitExpressionStatement(this);
    }
  };
  var FunctionStatement = class extends Statement {
    constructor(name, body, params) {
      super();
      this.name = name;
      this.body = body;
      this.params = params;
    }
    accept(visitor) {
      return visitor.visitFunctionStatement(this);
    }
  };
  var IfStatement = class extends Statement {
    constructor(condition, thenBranch, elseBranch) {
      super();
      this.condition = condition;
      this.thenBranch = thenBranch;
      this.elseBranch = elseBranch;
    }
    accept(visitor) {
      return visitor.visitIfStatement(this);
    }
  };
  var PrintStatement = class extends Statement {
    constructor(expression, comment) {
      super();
      this.expression = expression;
      this.comment = comment;
    }
    accept(visitor) {
      return visitor.visitPrintStatement(this);
    }
  };
  var ReturnStatement = class extends Statement {
    constructor(keyword, value) {
      super();
      this.keyword = keyword;
      this.value = value;
    }
    accept(visitor) {
      return visitor.visitReturnStatement(this);
    }
  };
  var VariableStatement = class extends Statement {
    constructor(name, initializer) {
      super();
      this.name = name;
      this.initializer = initializer;
    }
    accept(visitor) {
      return visitor.visitVariableStatement(this);
    }
  };
  var WhileStatement = class extends Statement {
    constructor(condition, body) {
      super();
      this.condition = condition;
      this.body = body;
    }
    accept(visitor) {
      return visitor.visitWhileStatement(this);
    }
  };

  // src/parser.ts
  var Parser = class {
    constructor(tokens) {
      this.current = 0;
      this.parse = () => {
        const statements = [];
        while (!this.isAtEnd()) {
          statements.push(this.declaration());
        }
        return statements;
      };
      this.tokens = tokens;
    }
    declaration() {
      if (this.match(38 /* VAR */)) {
        return this.varStatement();
      }
      if (this.match(26 /* FUN */)) {
        return this.funcStatement();
      }
      return this.statement();
    }
    varStatement() {
      const name = this.consume(
        19 /* IDENTIFIER */,
        "expect identifier after var"
      );
      let initializer = null;
      if (this.match(13 /* EQUAL */)) {
        initializer = this.expression();
      }
      this.consume(8 /* SEMICOLON */, "expected ; after declaration");
      return new VariableStatement(name, initializer);
    }
    funcStatement() {
      const functionName = this.consume(
        19 /* IDENTIFIER */,
        "expect identifier after func"
      );
      this.consume(0 /* LEFT_PAREN */, "expect ( after function name");
      const params = [];
      if (!this.check(1 /* RIGHT_PAREN */)) {
        do {
          params.push(
            this.consume(19 /* IDENTIFIER */, "expect parameter name")
          );
        } while (this.match(4 /* COMMA */));
      }
      this.consume(1 /* RIGHT_PAREN */, "expect ) after function name");
      this.consume(2 /* lEFT_BRACE */, "expect { after function parameters");
      const block = this.block();
      return new FunctionStatement(functionName, block, params);
    }
    statement() {
      if (this.match(28 /* IF */)) {
        return this.ifStatement();
      }
      if (this.match(34 /* PRINT */)) {
        return this.printStatement();
      }
      if (this.match(39 /* WHILE */)) {
        return this.whileStatement();
      }
      if (this.match(2 /* lEFT_BRACE */)) {
        return this.block();
      }
      if (this.match(35 /* RETURN */)) {
        return this.returnStatement();
      }
      return this.expressionStatement();
    }
    returnStatement() {
      const keyword = this.previous();
      let value = null;
      if (!this.check(8 /* SEMICOLON */)) {
        value = this.expression();
      }
      this.consume(8 /* SEMICOLON */, "expect ; after return");
      return new ReturnStatement(keyword, value);
    }
    whileStatement() {
      this.consume(0 /* LEFT_PAREN */, "expect ( after while");
      const expression = this.expression();
      this.consume(1 /* RIGHT_PAREN */, "expect ) after while");
      const body = this.statement();
      return new WhileStatement(expression, body);
    }
    ifStatement() {
      this.consume(0 /* LEFT_PAREN */, "expect ( after if");
      const expression = this.expression();
      this.consume(1 /* RIGHT_PAREN */, "expect ) after if");
      const thenBranch = this.statement();
      let elseBranch = null;
      if (this.match(23 /* ELSE */)) {
        elseBranch = this.statement();
      }
      return new IfStatement(expression, thenBranch, elseBranch);
    }
    block() {
      const statements = [];
      while (!this.check(3 /* RIGHT_BRACE */) && !this.isAtEnd()) {
        statements.push(this.declaration());
      }
      this.consume(3 /* RIGHT_BRACE */, "expect } after block");
      return new BlockStatement(statements);
    }
    printStatement() {
      const expr = this.expression();
      if (!this.isAtEnd()) {
        this.consume(8 /* SEMICOLON */, "expected ; after print");
      }
      let comment = null;
      if (isTestEnv() && this.match(41 /* LINE_COMMENT */)) {
        comment = this.previous();
      }
      return new PrintStatement(expr, comment);
    }
    expressionStatement() {
      const expr = this.expression();
      if (!this.isAtEnd()) {
        this.consume(8 /* SEMICOLON */, "expected ; after expression");
      }
      return new ExpressionStatement(expr);
    }
    expression() {
      return this.assignment();
    }
    assignment() {
      const expr = this.or();
      if (this.match(13 /* EQUAL */)) {
        const equal = this.previous();
        const value = this.assignment();
        if (expr instanceof VariableExpression) {
          const name = expr.name;
          return new AssignExpression(name, value);
        }
        throw new Error(`invalid assign target: ${equal}`);
      }
      return expr;
    }
    or() {
      let expr = this.and();
      while (this.match(31 /* OR */)) {
        const operator = this.previous();
        const right = this.and();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    }
    and() {
      let expr = this.equality();
      while (this.match(30 /* AND */)) {
        const operator = this.previous();
        const right = this.equality();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    }
    equality() {
      let expr = this.comparison();
      while (this.match(12 /* BANG_EQUAL */, 14 /* EQUAL_EQUAL */)) {
        const operator = this.previous();
        const right = this.comparison();
        expr = new BinaryExpression(expr, operator, right);
      }
      return expr;
    }
    comparison() {
      let term = this.term();
      while (this.match(
        15 /* GREATER */,
        16 /* GREATER_EQUAL */,
        17 /* LESS */,
        18 /* LESS_EQUAL */
      )) {
        const operator = this.previous();
        const right = this.term();
        term = new BinaryExpression(term, operator, right);
      }
      return term;
    }
    term() {
      let factor = this.factor();
      while (this.match(7 /* PLUS */, 6 /* MINUS */)) {
        const operator = this.previous();
        const right = this.factor();
        factor = new BinaryExpression(factor, operator, right);
      }
      return factor;
    }
    factor() {
      let unary = this.unary();
      while (this.match(10 /* STAR */, 9 /* SLASH */)) {
        const operator = this.previous();
        const right = this.unary();
        unary = new BinaryExpression(unary, operator, right);
      }
      return unary;
    }
    unary() {
      if (this.match(6 /* MINUS */, 11 /* BANG */)) {
        const operator = this.previous();
        const value = this.unary();
        return new UnaryExpression(operator, value);
      }
      return this.call();
    }
    call() {
      let expr = this.primary();
      while (true) {
        if (this.match(0 /* LEFT_PAREN */)) {
          expr = this.finishCall(expr);
        } else {
          break;
        }
      }
      return expr;
    }
    finishCall(callee) {
      const params = [];
      if (!this.check(1 /* RIGHT_PAREN */)) {
        do {
          params.push(this.expression());
        } while (this.match(4 /* COMMA */));
      }
      const paren = this.consume(
        1 /* RIGHT_PAREN */,
        "expect ) after arguments"
      );
      return new CallExpression(callee, paren, params);
    }
    primary() {
      if (this.match(25 /* TRUE */)) {
        return new LiteralExpression(true);
      }
      if (this.match(24 /* FALSE */)) {
        return new LiteralExpression(false);
      }
      if (this.match(29 /* NIL */)) {
        return new LiteralExpression(null);
      }
      if (this.match(21 /* NUMBER */, 20 /* STRING */)) {
        return new LiteralExpression(this.previous().literal);
      }
      if (this.match(19 /* IDENTIFIER */)) {
        return new VariableExpression(this.previous());
      }
      if (this.match(0 /* LEFT_PAREN */)) {
        const expr = this.expression();
        this.consume(
          1 /* RIGHT_PAREN */,
          `parser expected: '(',actual: ${JSON.stringify(this.peek())}`
        );
        return new GroupingExpression(expr);
      }
      throw new Error(
        `parser can not handle token: ${JSON.stringify(this.peek())}`
      );
    }
    consume(type, message) {
      if (this.peek().type === type) {
        this.advance();
        return this.previous();
      }
      throw new Error(message);
    }
    previous() {
      return this.tokens[this.current - 1];
    }
    match(...types) {
      for (let type of types) {
        if (this.check(type)) {
          this.advance();
          return true;
        }
      }
      return false;
    }
    advance() {
      if (this.isAtEnd()) {
        return;
      }
      this.current++;
    }
    check(type) {
      if (this.isAtEnd()) {
        return false;
      }
      return this.peek().type === type;
    }
    isAtEnd() {
      return this.peek().type === 40 /* EOF */;
    }
    peek() {
      return this.tokens[this.current];
    }
  };
  var parser_default = Parser;

  // src/eventEmitter.ts
  var EventEmitter = class {
    constructor() {
      this.event = {};
    }
    getEventLength(name) {
      const temp = this.event[name];
      return temp && temp.length || 0;
    }
    on(name, callback) {
      this.event[name] = this.event[name] || [];
      this.event[name].push(callback);
      return () => this.off(name, callback);
    }
    emitAsync(name, data) {
      const list = this.event[name];
      if (!list || list.length <= 0) {
        return;
      }
      for (const item of list) {
        window.requestAnimationFrame(() => {
          item(data);
        });
      }
    }
    emit(name, data) {
      const list = this.event[name];
      if (!list || list.length <= 0) {
        return;
      }
      for (const item of list) {
        item(data);
      }
    }
    off(name, callback) {
      const result = [];
      const events = this.event[name];
      if (events && callback) {
        for (const item of events) {
          if (item !== callback && item._ !== callback) {
            result.push(item);
          }
        }
      }
      if (result.length) {
        this.event[name] = result;
      } else {
        delete this.event[name];
      }
    }
    offAll() {
      this.event = {};
    }
    once(name, callback) {
      const listener = (data) => {
        this.off(name, listener);
        callback(data);
      };
      listener._ = callback;
      return this.on(name, listener);
    }
  };
  var eventEmitter = new EventEmitter();
  var eventEmitter_default = eventEmitter;

  // src/environment.ts
  var Environment = class {
    constructor(parent) {
      this.values = /* @__PURE__ */ new Map();
      this.parent = null;
      this.parent = parent;
    }
    get(name) {
      if (this.values.has(name.lexeme)) {
        return this.values.get(name.lexeme);
      }
      if (this.parent !== null) {
        return this.parent.get(name);
      }
      throw new Error(`${name.lexeme} is not defined`);
    }
    define(name, value) {
      this.values.set(name, value);
    }
    assign(name, value) {
      if (this.values.has(name.lexeme)) {
        this.values.set(name.lexeme, value);
        return;
      }
      if (this.parent !== null) {
        this.parent.assign(name, value);
        return;
      }
      throw new Error(`${name.lexeme} is not defined`);
    }
  };
  var environment_default = Environment;

  // src/expect.ts
  var Expect = class {
    constructor() {
      this.total = 0;
      this.success = 0;
    }
    add() {
      this.total++;
    }
    addSuccess() {
      this.success++;
    }
  };
  var globalExpect = new Expect();
  var expect_default = globalExpect;

  // src/loxCallable.ts
  var LoxCallable = class {
    constructor(declaration, closure) {
      this.declaration = declaration;
      this.closure = closure;
    }
    call(interpreter, argumentList) {
      var _a;
      const env = new environment_default(this.closure);
      for (let i = 0; i < this.declaration.params.length; i++) {
        env.define((_a = this.declaration.params[i]) == null ? void 0 : _a.lexeme, argumentList[i]);
      }
      return interpreter.executeBlock(this.declaration.body, env);
    }
    size() {
      return 0;
    }
    toString() {
      return `<fn ${this.declaration.name.lexeme}>`;
    }
  };

  // src/returnValue.ts
  var ReturnValue = class extends Error {
    constructor(value) {
      super(value);
      this.value = value;
    }
  };

  // src/interpreter.ts
  var MAX_WHILE_COUNT = 15e6;
  var Interpreter = class {
    constructor() {
      this.globals = new environment_default(null);
      this.environment = this.globals;
      this.interpret = (list, env) => {
        this.globals = env;
        this.environment = env;
        for (const item of list) {
          this.execute(item);
        }
      };
      this.execute = (statement) => {
        return statement.accept(this);
      };
      this.evaluate = (expr) => {
        return expr.accept(this);
      };
      this.visitExpressionStatement = (statement) => {
        return this.evaluate(statement.expression);
      };
      this.visitBlockStatement = (statement) => {
        return this.executeBlock(statement, new environment_default(this.environment));
      };
      this.executeBlock = (statement, environment) => {
        const previous = this.environment;
        let result = null;
        try {
          this.environment = environment;
          for (let item of statement.statements) {
            this.execute(item);
          }
        } catch (error) {
          if (error instanceof ReturnValue) {
            result = error.value;
          }
        } finally {
          this.environment = previous;
        }
        return result;
      };
      this.visitClassStatement = (statement) => {
        console.log(statement);
        return null;
      };
      this.visitFunctionStatement = (statement) => {
        this.environment.define(statement.name.lexeme, new LoxCallable(statement, this.environment));
        return null;
      };
      this.visitIfStatement = (statement) => {
        if (this.isTruthy(this.evaluate(statement.condition))) {
          this.execute(statement.thenBranch);
        } else if (statement.elseBranch) {
          this.execute(statement.elseBranch);
        }
        return null;
      };
      this.visitPrintStatement = (statement) => {
        const result = this.evaluate(statement.expression);
        console.log(result);
        eventEmitter_default.emit("print", { value: result });
        if (isTestEnv() && statement.comment !== null) {
          const expect = statement.comment.lexeme;
          const actual = convertLiteralTypeToString(result);
          expect_default.add();
          if (expect === actual) {
            expect_default.addSuccess();
          } else {
            throw new Error(`visitPrintStatement expect: ${expect},actual: ${actual}, line: ${statement.comment.line}`);
          }
        }
        return null;
      };
      this.visitReturnStatement = (statement) => {
        if (statement.value !== null) {
          const result = this.evaluate(statement.value);
          throw new ReturnValue(result);
        }
        return null;
      };
      this.visitVariableStatement = (statement) => {
        let value = null;
        if (statement.initializer !== null) {
          value = this.evaluate(statement.initializer);
        }
        this.environment.define(statement.name.lexeme, value);
        return null;
      };
      this.visitWhileStatement = (statement) => {
        let count = 0;
        while (this.isTruthy(this.evaluate(statement.condition))) {
          this.execute(statement.body);
          count++;
          if (count > MAX_WHILE_COUNT) {
            throw new Error("over max while count");
          }
        }
        return null;
      };
      this.visitAssignExpression = (expr) => {
        const temp = this.evaluate(expr.value);
        this.environment.assign(expr.name, temp);
        return temp;
      };
      this.visitBinaryExpression = (expr) => {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.operator.type) {
          case 6 /* MINUS */:
            return Number(left) - Number(right);
          case 7 /* PLUS */:
            if (typeof left === "number" && typeof right === "number") {
              return Number(left) + Number(right);
            }
            if (typeof left === "string" || typeof right === "string") {
              return String(left) + String(right);
            }
            if (typeof left === "string" && typeof right === "number" || typeof left === "number" && typeof right === "string") {
              return String(left) + String(right);
            }
            return null;
          case 10 /* STAR */:
            return Number(left) * Number(right);
          case 9 /* SLASH */: {
            const temp = Number(right);
            if (temp === 0) {
              throw new Error("slash is zero");
            }
            return Number(left) / temp;
          }
          case 15 /* GREATER */:
            return Number(left) > Number(right);
          case 16 /* GREATER_EQUAL */:
            return Number(left) >= Number(right);
          case 17 /* LESS */:
            return Number(left) < Number(right);
          case 18 /* LESS_EQUAL */:
            return Number(left) <= Number(right);
          case 12 /* BANG_EQUAL */:
            return !this.isEqual(left, right);
          case 14 /* EQUAL_EQUAL */:
            return this.isEqual(left, right);
        }
        return null;
      };
      this.visitCallExpression = (expr) => {
        const callee = this.evaluate(expr.callee);
        const argumentList = [];
        for (let item of expr.argumentList) {
          argumentList.push(this.evaluate(item));
        }
        if (!isBaseCallable(callee)) {
          throw new RuntimeError(expr.paren, "can only call functions");
        }
        return callee.call(this, argumentList);
      };
      this.visitGetExpression = (expr) => {
        return this.parenthesize(expr.name.lexeme, expr.object);
      };
      this.visitSetExpression = (expr) => {
        return this.parenthesize(expr.name.lexeme, expr.object, expr.value);
      };
      this.visitLogicalExpression = (expr) => {
        const left = this.evaluate(expr.left);
        if (expr.operator.type === 31 /* OR */) {
          if (this.isTruthy(left)) {
            return left;
          }
        } else {
          if (!this.isTruthy(left)) {
            return left;
          }
        }
        return this.evaluate(expr.right);
      };
      this.visitSuperExpression = (expr) => {
        return this.parenthesize(expr.keyword.lexeme, expr.value);
      };
      this.visitThisExpression = (expr) => {
        return this.parenthesize(expr.keyword.lexeme);
      };
      this.visitVariableExpression = (expr) => {
        return this.environment.get(expr.name);
      };
      this.visitGroupingExpression = (expr) => {
        return this.evaluate(expr.expression);
      };
      this.visitLiteralExpression = (expr) => {
        return expr.value;
      };
      this.visitUnaryExpression = (expr) => {
        const right = this.evaluate(expr.right);
        switch (expr.operator.type) {
          case 6 /* MINUS */:
            return -Number(right);
          case 11 /* BANG */:
            return !this.isTruthy(right);
        }
        return null;
      };
      this.print = (expr) => {
        return expr.accept(this);
      };
    }
    isEqual(left, right) {
      if (left === null && right === null) {
        return true;
      }
      if (left === null) {
        return false;
      }
      return left === right;
    }
    isTruthy(value) {
      if (value === null) {
        return false;
      }
      return Boolean(value);
    }
    parenthesize(name, ...exprs) {
      const list = [];
      for (let expr of exprs) {
        list.push(expr.accept(this));
      }
      return `(${name} ${list.join(" ")})`;
    }
  };
  var interpreter_default = Interpreter;

  // src/debug.ts
  var DEBUG_COLOR_LIST = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  var _Debug = class {
    constructor(namespace) {
      this.init = () => {
        return this.log;
      };
      this.log = (...rest) => {
        if (!this.enable()) {
          return;
        }
        const { namespace } = this;
        const color = _Debug.colorMap.get(namespace);
        const result = [`%c ${namespace}:`, `color:${color};`, ...rest];
        console.log(...result);
      };
      this.namespace = namespace;
      this.setColor();
    }
    enable() {
      return this.checkEnable();
    }
    checkEnable() {
      if (typeof window === "undefined") {
        if (typeof process !== "undefined" && process && process.env && process.env["DEBUG"] && process.env["DEBUG"] === "*") {
          return true;
        }
        return false;
      }
      if (window && window.localStorage && window.localStorage.getItem && typeof window.localStorage.getItem === "function") {
        return localStorage.getItem("debug") === "*";
      }
      return false;
    }
    setColor() {
      if (!_Debug.colorMap.has(this.namespace)) {
        const index = Math.floor(Math.random() * DEBUG_COLOR_LIST.length);
        const color = DEBUG_COLOR_LIST[index];
        if (color) {
          _Debug.colorMap.set(this.namespace, color);
        }
      }
    }
  };
  var Debug = _Debug;
  Debug.colorMap = /* @__PURE__ */ new Map();
  var debug_default = Debug;

  // src/native.ts
  var NativeClock = class {
    call() {
      return Math.floor(new Date().getTime() / 1e3);
    }
    size() {
      return 0;
    }
    toString() {
      return `<native fn>`;
    }
  };

  // src/lox.ts
  var debug = new debug_default("lox").init();
  var Lox = class {
    run(text, env) {
      const scanner = new scanner_default(text);
      const tokens = scanner.scanTokens();
      debug(tokens);
      const parser = new parser_default(tokens);
      const statements = parser.parse();
      debug(statements);
      const interpreter = new interpreter_default();
      env.define("clock", new NativeClock());
      interpreter.interpret(statements, env);
    }
  };
  return __toCommonJS(src_exports);
})();

    for(var key in __export__) {
            exports[key] = __export__[key]
        }
    }));
//# sourceMappingURL=lox.umd.js.map
