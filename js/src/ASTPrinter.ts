import {
  ExpressionType,
  ExpressionVisitor,
  Expression,
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
  VariableExpression,
} from './expression';

class ASTPrinter implements ExpressionVisitor<ExpressionType> {
  visitAssignExpr = (expr: AssignExpression<ExpressionType>) => {
    return this.parenthesize(expr.name.lexeme, expr.value);
  };
  visitBinaryExpr = (expr: BinaryExpression<ExpressionType>) => {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  };
  visitCallExpr = (expr: CallExpression<ExpressionType>) => {
    return this.parenthesize(
      expr.paren.lexeme,
      expr.callee,
      ...expr.argumentsList,
    );
  };
  visitGetExpr = (expr: GetExpression<ExpressionType>) => {
    return this.parenthesize(expr.name.lexeme, expr.object);
  };
  visitSetExpr = (expr: SetExpression<ExpressionType>) => {
    return this.parenthesize(expr.name.lexeme, expr.object, expr.value);
  };
  visitLogicalExpr = (expr: LogicalExpression<ExpressionType>) => {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  };
  visitSuperExpr = (expr: SuperExpression<ExpressionType>) => {
    return this.parenthesize(expr.keyword.lexeme, expr.value);
  };
  visitThisExpr = (expr: ThisExpression<ExpressionType>) => {
    return this.parenthesize(expr.keyword.lexeme);
  };
  visitVariableExpr = (expr: VariableExpression<ExpressionType>) => {
    return this.parenthesize(expr.name.lexeme);
  };
  visitGroupingExpr = (expr: GroupingExpression<ExpressionType>) => {
    return this.parenthesize('group', expr.expression);
  };
  visitLiteralExpr = (expr: LiteralExpression<ExpressionType>) => {
    if (expr.value === null) {
      return 'nil';
    }
    return expr.value.toString();
  };
  visitUnaryExpr = (expr: UnaryExpression<ExpressionType>) => {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  };
  print = (expr: Expression<ExpressionType>) => {
    return expr.accept(this);
  };
  private parenthesize(
    name: string,
    ...exprs: Expression<ExpressionType>[]
  ): ExpressionType {
    const list: ExpressionType[] = [];
    for (let expr of exprs) {
      list.push(expr.accept(this));
    }
    return `(${name} ${list.join(' ')})`;
  }
}

export default ASTPrinter;
