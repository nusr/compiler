import type { LiteralType, BaseCallable } from './type';

export function convertLiteralTypeToString(val: LiteralType): string {
  if (val === null) {
    return 'null';
  }
  if (typeof val === 'string') {
    return val;
  }
  if (typeof val === 'boolean') {
    return val.toString();
  }
  if (typeof val === 'number') {
    return val.toString();
  }
  if (val && typeof val.toString === 'function') {
    return val.toString();
  }
  return '';
}

function isFunction(fun: any): fun is Function {
  return typeof fun === 'function';
}

export function isBaseCallable(call: any): call is BaseCallable {
  return (
    'size' in call &&
    'toString' in call &&
    'call' in call &&
    isFunction(call.size) &&
    isFunction(call.toString) &&
    isFunction(call.call)
  );
}

export function getVersion(): string {
  // @ts-ignore
  return process.env.VERSION;
}

export function isTestEnv(): boolean {
  // @ts-ignore
  return process.env.NODE_ENV === 'test';
}
