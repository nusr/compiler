import {
  AssignExpression,
  BinaryExpression,
  CallExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  LogicalExpression,
  UnaryExpression,
  VariableExpression,
} from './expression';
import type { LiteralType } from './type';
import { TokenType } from './tokenType';
import Token from './token';
import {
  BlockStatement,
  ExpressionStatement,
  FunctionStatement,
  IfStatement,
  PrintStatement,
  ReturnStatement,
  Statement,
  VariableStatement,
  WhileStatement,
} from './statement';

import { isTestEnv } from './util';

class Parser {
  private readonly tokens: Token[];
  private current = 0;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  parse = (): Statement<LiteralType>[] => {
    const statements: Statement<LiteralType>[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }
    return statements;
  };
  private declaration(): Statement<LiteralType> {
    if (this.match(TokenType.VAR)) {
      return this.varStatement();
    }

    if (this.match(TokenType.FUN)) {
      return this.funcStatement();
    }

    return this.statement();
  }
  private varStatement(): Statement<LiteralType> {
    const name: Token = this.consume(
      TokenType.IDENTIFIER,
      'expect identifier after var',
    );
    let initializer: Expression<LiteralType> | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'expected ; after declaration');
    return new VariableStatement(name, initializer);
  }
  private funcStatement(): Statement<LiteralType> {
    const functionName: Token = this.consume(
      TokenType.IDENTIFIER,
      'expect identifier after func',
    );
    this.consume(TokenType.LEFT_PAREN, 'expect ( after function name');
    const params: Token[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        params.push(
          this.consume(TokenType.IDENTIFIER, 'expect parameter name'),
        );
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, 'expect ) after function name');
    this.consume(TokenType.lEFT_BRACE, 'expect { after function parameters');
    const block = this.block();
    return new FunctionStatement(functionName, block, params);
  }
  private statement(): Statement<LiteralType> {
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.lEFT_BRACE)) {
      return this.block();
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }
    return this.expressionStatement();
  }
  private returnStatement(): ReturnStatement<LiteralType> {
    const keyword = this.previous();
    let value: Expression<LiteralType> | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'expect ; after return');
    return new ReturnStatement(keyword, value);
  }
  private whileStatement(): Statement<LiteralType> {
    this.consume(TokenType.LEFT_PAREN, 'expect ( after while');
    const expression = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'expect ) after while');
    const body = this.statement();
    return new WhileStatement<LiteralType>(expression, body);
  }
  private ifStatement(): Statement<LiteralType> {
    this.consume(TokenType.LEFT_PAREN, 'expect ( after if');
    const expression = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'expect ) after if');
    const thenBranch: Statement<LiteralType> = this.statement();
    let elseBranch: Statement<LiteralType> | null = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }
    return new IfStatement<LiteralType>(expression, thenBranch, elseBranch);
  }
  private block(): BlockStatement<LiteralType> {
    const statements: Statement<LiteralType>[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }
    this.consume(TokenType.RIGHT_BRACE, 'expect } after block');
    return new BlockStatement<LiteralType>(statements);
  }
  private printStatement(): PrintStatement<LiteralType> {
    const expr = this.expression();
    if (!this.isAtEnd()) {
      this.consume(TokenType.SEMICOLON, 'expected ; after print');
    }
    let comment: Token | null = null;
    if (isTestEnv() && this.match(TokenType.LINE_COMMENT)) {
      comment = this.previous();
    }
    return new PrintStatement<LiteralType>(expr, comment);
  }
  private expressionStatement(): Statement<LiteralType> {
    const expr = this.expression();
    if (!this.isAtEnd()) {
      this.consume(TokenType.SEMICOLON, 'expected ; after expression');
    }
    return new ExpressionStatement<LiteralType>(expr);
  }
  public expression(): Expression<LiteralType> {
    return this.assignment();
  }
  private assignment(): Expression<LiteralType> {
    const expr = this.or();
    if (this.match(TokenType.EQUAL)) {
      const equal: Token = this.previous();
      const value = this.assignment();
      if (expr instanceof VariableExpression) {
        const name = expr.name;
        return new AssignExpression<LiteralType>(name, value);
      }
      throw new Error(`invalid assign target: ${equal}`);
    }
    return expr;
  }

  private or(): Expression<LiteralType> {
    let expr = this.and();
    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new LogicalExpression<LiteralType>(expr, operator, right);
    }
    return expr;
  }

  private and(): Expression<LiteralType> {
    let expr = this.equality();
    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new LogicalExpression<LiteralType>(expr, operator, right);
    }
    return expr;
  }

  private equality(): Expression<LiteralType> {
    let expr: Expression<LiteralType> = this.comparison();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expression<LiteralType> = this.comparison();
      expr = new BinaryExpression(expr, operator, right);
    }
    return expr;
  }
  private comparison(): Expression<LiteralType> {
    let term: Expression<LiteralType> = this.term();
    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator: Token = this.previous();
      const right: Expression<LiteralType> = this.term();
      term = new BinaryExpression(term, operator, right);
    }
    return term;
  }
  private term(): Expression<LiteralType> {
    let factor: Expression<LiteralType> = this.factor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expression<LiteralType> = this.factor();
      factor = new BinaryExpression(factor, operator, right);
    }
    return factor;
  }
  private factor(): Expression<LiteralType> {
    let unary: Expression<LiteralType> = this.unary();
    while (this.match(TokenType.STAR, TokenType.SLASH)) {
      const operator: Token = this.previous();
      const right: Expression<LiteralType> = this.unary();
      unary = new BinaryExpression(unary, operator, right);
    }
    return unary;
  }
  private unary(): Expression<LiteralType> {
    if (this.match(TokenType.MINUS, TokenType.BANG)) {
      const operator: Token = this.previous();
      const value = this.unary();
      return new UnaryExpression(operator, value);
    }
    return this.call();
  }
  private call(): Expression<LiteralType> {
    let expr: Expression<LiteralType> = this.primary();
    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }
    return expr;
  }
  private finishCall(callee: Expression<LiteralType>): Expression<LiteralType> {
    const params: Expression<LiteralType>[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      'expect ) after arguments',
    );
    return new CallExpression(callee, paren, params);
  }

  private primary(): Expression<LiteralType> {
    if (this.match(TokenType.TRUE)) {
      return new LiteralExpression(true);
    }
    if (this.match(TokenType.FALSE)) {
      return new LiteralExpression(false);
    }
    if (this.match(TokenType.NIL)) {
      return new LiteralExpression(null);
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpression(this.previous().literal);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpression(this.previous());
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expression<LiteralType> = this.expression();
      this.consume(
        TokenType.RIGHT_PAREN,
        `parser expected: '(',actual: ${JSON.stringify(this.peek())}`,
      );
      return new GroupingExpression(expr);
    }

    throw new Error(
      `parser can not handle token: ${JSON.stringify(this.peek())}`,
    );
  }
  private consume(type: TokenType, message: string) {
    if (this.peek().type === type) {
      this.advance();
      return this.previous();
    }
    throw new Error(message);
  }
  private previous(): Token {
    return this.tokens[this.current - 1] as Token;
  }
  private match(...types: TokenType[]): boolean {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  private advance() {
    if (this.isAtEnd()) {
      return;
    }
    this.current++;
  }
  private check(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }
  private peek(): Token {
    return this.tokens[this.current] as Token;
  }
}

export default Parser;
