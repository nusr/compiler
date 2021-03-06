import type { LiteralType, BaseCallable } from './type';
import type Interpreter from './interpreter';
import type { FunctionStatement } from './statement';
import Environment from './environment';

class LoxCallable implements BaseCallable {
  private readonly declaration: FunctionStatement<LiteralType>;
  private readonly closure: Environment;
  constructor(
    declaration: FunctionStatement<LiteralType>,
    closure: Environment,
  ) {
    this.declaration = declaration;
    this.closure = closure;
  }
  call(interpreter: Interpreter, argumentList: LiteralType[]): LiteralType {
    const env = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      env.define(this.declaration.params[i]?.lexeme!, argumentList[i]);
    }
    return interpreter.executeBlock(this.declaration.body, env);
  }
  size(): number {
    return 0;
  }
  toString() {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}

export { LoxCallable };
