package main

import "fmt"

type Parser struct {
	tokens  []*Token
	current int
}

func NewParser(tokens []*Token) *Parser {
	return &Parser{
		current: 0,
		tokens:  tokens,
	}
}
func (parser *Parser) peek() *Token {
	return parser.tokens[parser.current]
}

func (parser *Parser) advance() {
	if parser.isAtEnd() {
		return
	}
	parser.current++
}

func (parser *Parser) previous() *Token {
	return parser.tokens[parser.current-1]
}

func (parser *Parser) consume(tokenType TokenType, message string) *Token {
	if parser.peek().tokenType != tokenType {
		panic(message)
	}
	parser.advance()
	return parser.previous()
}

func (parser *Parser) check(tokenType TokenType) bool {
	if parser.isAtEnd() {
		return false
	}
	return parser.peek().tokenType == tokenType
}

func (parser *Parser) match(tokenTypes ...TokenType) bool {
	for _, tokenType := range tokenTypes {
		if parser.check(tokenType) {
			parser.advance()
			return true
		}
	}
	return false
}

func (parser *Parser) varStatement() Statement {
	name := parser.consume(IDENTIFIER, "expect identifier after var")
	return VariableStatement{
		name:        name,
		initializer: nil,
	}
}
func (parser *Parser) primary() Expression {
	if parser.match(TRUE) {
		return LiteralExpression{
			value: true,
		}
	}
	if parser.match(FALSE) {
		return LiteralExpression{
			value: false,
		}
	}
	if parser.match(NULL) {
		return LiteralExpression{
			value: nil,
		}
	}
	if parser.match(NUMBER, STRING) {
		return LiteralExpression{
			value: parser.previous().literal,
		}
	}
	if parser.match(IDENTIFIER) {
		expr := parser.expression()
		parser.consume(RIGHT_PAREN, fmt.Sprintf("parser expected '(', actual:%s", parser.peek()))
		return GroupingExpression{
			expression: expr,
		}
	}
	panic(fmt.Sprintf("parser can not handle token: %s", parser.peek()))
}
func (parser *Parser) unary() Expression {
	if parser.match(MINUS, BANG) {
		operator := parser.previous()
		value := parser.unary()
		return UnaryExpression{
			operator: operator,
			right:    value,
		}
	}
	return parser.primary()

}
func (parser *Parser) factor() Expression {
	unary := parser.unary()
	for parser.match(STAR, SLASH) {
		operator := parser.previous()
		right := parser.unary()
		unary = BinaryExpression{
			left:     unary,
			operator: operator,
			right:    right,
		}
	}
	return unary
}

func (parser *Parser) term() Expression {
	factor := parser.factor()
	for parser.match(PLUS, MINUS) {
		operator := parser.previous()
		right := parser.factor()
		factor = BinaryExpression{
			left:     factor,
			operator: operator,
			right:    right,
		}
	}
	return factor
}

func (parser *Parser) comparison() Expression {
	term := parser.term()
	for parser.match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL) {
		operator := parser.previous()
		right := parser.term()
		term = BinaryExpression{
			left:     term,
			operator: operator,
			right:    right,
		}
	}
	return term
}

func (parser *Parser) equality() Expression {
	expr := parser.comparison()
	for parser.match(BANG_EQUAL, EQUAL_EQUAL) {
		operator := parser.previous()
		right := parser.comparison()
		expr = BinaryExpression{
			left:     expr,
			operator: operator,
			right:    right,
		}
	}
	return expr
}

func (parser *Parser) and() Expression {
	expr := parser.equality()
	for parser.match(AND) {
		operator := parser.previous()
		right := parser.and()
		expr = LogicalExpression{
			left:     expr,
			operator: operator,
			right:    right,
		}
	}
	return expr
}
func (parser *Parser) or() Expression {
	expr := parser.and()
	for parser.match(OR) {
		operator := parser.previous()
		right := parser.and()
		expr = LogicalExpression{
			left:     expr,
			operator: operator,
			right:    right,
		}
	}
	return expr
}
func (parser *Parser) assignment() Expression {
	expr := parser.or()
	if parser.match(EQUAL) {
		equal := parser.previous()
		value := parser.assignment()
		if val, ok := value.(VariableExpression); ok {
			name := val.name
			return AssignExpression{
				name:  name,
				value: val,
			}
		}
		panic(fmt.Sprintf("invalid assign target: %s", equal))
	}
	return expr
}

func (parser *Parser) expression() Expression {
	return parser.assignment()
}

func (parser *Parser) ifStatement() Statement {
	parser.consume(LEFT_PAREN, "expect ( after if")
	expression := parser.expression()
	parser.consume(RIGHT_BRACE, "expected ) after if")
	thenBranch := parser.statement()
	// elseBranch := interface{}
	// if parser.match(ELSE) {
	// 	elseBranch = parser.statement()
	// }
	return IfStatement{
		condition:  expression,
		thenBranch: thenBranch,
		// elseBranch: elseBranch,
	}
}

func (parser *Parser) printStatement() Statement {
	expr := parser.expression()
	if !parser.isAtEnd() {
		parser.consume(SEMICOLON, "expected ; after print")
	}
	return PrintStatement{
		expression: expr,
	}
}

func (parser *Parser) expressionStatement() Statement {
	expr := parser.expression()
	if !parser.isAtEnd() {
		parser.consume(SEMICOLON, "expected ; after expression")
	}
	return ExpressionStatement{
		expression: expr,
	}
}

func (parser *Parser) statement() Statement {
	if parser.match(IF) {
		return parser.ifStatement()
	}
	if parser.match(PRINT) {
		return parser.printStatement()
	}
	// if parser.match(WHILE) {
	// 	return
	// }
	return parser.expressionStatement()
}

func (parser *Parser) declaration() Statement {
	if parser.match(VAR) {
		return parser.varStatement()
	}
	return parser.statement()
}

func (parser *Parser) Parse() []Statement {
	var statements []Statement
	for !parser.isAtEnd() {
		statements = append(statements, parser.declaration())
	}
	return statements
}

func (parser *Parser) isAtEnd() bool {
	return parser.peek().tokenType == EOF
}