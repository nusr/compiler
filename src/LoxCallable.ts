import type { LiteralType } from './type';;
import type Interpreter  from './Interpreter';
class LoxCallable {
  call(interpreter: Interpreter, argumentList: LiteralType[]): LiteralType {
    return argumentList[0];
  }
  arity(): number {
    return 0;
  }
}

export { LoxCallable };