import type { LiteralType } from './type';

import type {
  BinaryExpression,
  GroupingExpression,
  LiteralExpression,
  UnaryExpression,
  AssignExpression,
  CallExpression,
  GetExpression,
  SetExpression,
  LogicalExpression,
  SuperExpression,
  ThisExpression,
  Expression,
  ExpressionVisitor,
  VariableExpression,
} from './expression';
import { TokenType } from './tokenType';

import type {
  FunctionStatement,
  IfStatement,
  PrintStatement,
  ReturnStatement,
  StatementVisitor,
  ExpressionStatement,
  Statement,
  BlockStatement,
  WhileStatement,
  ClassStatement,
  VariableStatement,
} from './statement';

import eventEmitter from './EventEmitter';

class Interpreter
  implements ExpressionVisitor<LiteralType>, StatementVisitor<LiteralType>
{
  interpret = (list: Statement<LiteralType>[]): void => {
    for (const item of list) {
      this.execute(item);
    }
  };
  private execute = (statement: Statement<LiteralType>) => {
    statement.accept(this);
  };
  visitExpressionStatement = (statement: ExpressionStatement<LiteralType>) => {
    this.evaluate(statement.expression);
    return null;
  };
  visitBlockStatement = (statement: BlockStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitClassStatement = (statement: ClassStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitFunctionStatement = (statement: FunctionStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitIfStatement = (statement: IfStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitPrintStatement = (statement: PrintStatement<LiteralType>) => {
    const result: LiteralType = this.evaluate(statement.expression);
    console.log(result);
    eventEmitter.emit('print', { value: result })
    return null;
  };
  visitReturnStatement = (statement: ReturnStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitVariableStatement = (statement: VariableStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };
  visitWhileStatement = (statement: WhileStatement<LiteralType>) => {
    console.log(statement);
    return null;
  };

  visitAssignExpression = (expr: AssignExpression<LiteralType>) => {
    return this.parenthesize(expr.name.lexeme, expr.value);
  };
  visitBinaryExpression = (
    expr: BinaryExpression<LiteralType>,
  ): LiteralType => {
    const left: LiteralType = this.evaluate(expr.left);
    const right: LiteralType = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return Number(left) + Number(right);
        }
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        if (
          (typeof left === 'string' && typeof right === 'number') ||
          (typeof left === 'number' && typeof right === 'string')
        ) {
          return String(left) + String(right);
        }
        break;
      case TokenType.STAR:
        return Number(left) * Number(right);
      case TokenType.SLASH: {
        const temp = Number(right);
        if (temp === 0) {
          throw new Error('slash is zero');
        }
        return Number(left) / temp;
      }

      case TokenType.GREATER:
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        return Number(left) >= Number(right);
      case TokenType.LESS:
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }
    return null;
  };
  visitCallExpression = (expr: CallExpression<LiteralType>) => {
    return this.parenthesize(
      expr.paren.lexeme,
      expr.callee,
      ...expr.argumentList,
    );
  };
  visitGetExpression = (expr: GetExpression<LiteralType>) => {
    return this.parenthesize(expr.name.lexeme, expr.object);
  };
  visitSetExpression = (expr: SetExpression<LiteralType>) => {
    return this.parenthesize(expr.name.lexeme, expr.object, expr.value);
  };
  visitLogicalExpression = (expr: LogicalExpression<LiteralType>) => {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  };
  visitSuperExpression = (expr: SuperExpression<LiteralType>) => {
    return this.parenthesize(expr.keyword.lexeme, expr.value);
  };
  visitThisExpression = (expr: ThisExpression<LiteralType>) => {
    return this.parenthesize(expr.keyword.lexeme);
  };
  visitVariableExpression = (expr: VariableExpression<LiteralType>) => {
    return this.parenthesize(expr.name.lexeme);
  };
  visitGroupingExpression = (
    expr: GroupingExpression<LiteralType>,
  ): LiteralType => {
    return this.evaluate(expr.expression);
  };
  visitLiteralExpression = (
    expr: LiteralExpression<LiteralType>,
  ): LiteralType => {
    return expr.value;
  };
  visitUnaryExpression = (expr: UnaryExpression<LiteralType>): LiteralType => {
    const right: LiteralType = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -Number(right);
      case TokenType.BANG:
        return !this.isTruthy(right);
    }
    return null;
  };

  evaluate = (expr: Expression<LiteralType>) => {
    return expr.accept(this);
  };

  print = (expr: Expression<LiteralType>) => {
    return expr.accept(this);
  };
  isEqual(left: LiteralType, right: LiteralType) {
    if (left === null && right === null) {
      return true;
    }
    if (left === null) {
      return false;
    }
    return left === right;
  }
  isTruthy(value: LiteralType) {
    if (value === null) {
      return false;
    }
    return Boolean(value);
  }
  private parenthesize(
    name: string,
    ...exprs: Expression<LiteralType>[]
  ): LiteralType {
    const list: LiteralType[] = [];
    for (let expr of exprs) {
      list.push(expr.accept(this));
    }
    return `(${name} ${list.join(' ')})`;
  }
}

export default Interpreter;