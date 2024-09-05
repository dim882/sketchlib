// Identity Functor

export type IBox<T> = {
  chain: <U>(f: (value: T) => IBox<U>) => IBox<U>;
  map: <U>(f: (value: T) => U) => IBox<U>;
  fold: <U>(f: (value: T) => U) => U;
  toString: () => string;
};

export const Box = <T>(x: T): IBox<T> => ({
  chain: (f) => f(x),
  map: (f) => Box(f(x)),
  fold: (f) => f(x),
  toString: () => `Box(${x})`,
});

// Either Monad

export type IRight<R> = {
  chain: <T>(f: (value: R) => Either<any, T>) => Either<any, T>;
  map: <T>(f: (value: R) => T) => IRight<T>;
  fold: <T>(f: (value: any) => T, g: (value: R) => T) => T;
  toString: () => string;
};

export type ILeft<L> = {
  chain: <T>(f: (value: L) => Either<T, any>) => ILeft<L>;
  map: <T>(f: (value: L) => T) => ILeft<L>;
  fold: <T>(f: (value: L) => T, g: (value: any) => T) => T;
  toString: () => string;
};

export type Either<L, R> = ILeft<L> | IRight<R>;

export const Right = <R>(x: R): IRight<R> => ({
  chain: (f) => f(x),
  map: (f) => Right(f(x)),
  fold: (f, g) => g(x),
  toString: () => `Right(${x})`,
});

export const Left = <L>(x: L): ILeft<L> => ({
  chain: (f) => Left(x),
  map: (f) => Left(x),
  fold: (f, g) => f(x),
  toString: () => `Left(${x})`,
});

export const fromNullable = <L, R>(x: R | null | undefined): Either<L, R> =>
  x !== null && x !== undefined ? Right(x) : Left<L>(x as unknown as L);

export const tryCatch = <L, R>(f: () => R): Either<L, R> => {
  try {
    return Right(f());
  } catch (e) {
    return Left(e as L);
  }
};
// Curry
type Curried<Fn> = Fn extends (...args: infer Args) => infer R ? CurriedArgs<Args, R> : never;

type CurriedArgs<Args, R> = Args extends [infer First, ...infer Rest] ? (arg: First) => CurriedArgs<Rest, R> : R;

function curry<Fn extends (...args: any[]) => any>(fn: Fn): Curried<Fn> {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return (...moreArgs: any[]) => curried(...args, ...moreArgs);
    }
  } as Curried<Fn>;
}

type Fork<T> = (reject: (err: any) => void, resolve: (value: T) => void) => void;

interface ITask<T> {
  fork: Fork<T>;
  ap<U>(other: ITask<(value: T) => U>): ITask<U>;
  map<U>(f: (value: T) => U): ITask<U>;
  chain<U>(f: (value: T) => ITask<U>): ITask<U>;
  concat(other: ITask<T>): ITask<T>;
  fold<U>(f: (value: any) => ITask<U>, g: (value: T) => ITask<U>): ITask<U>;
}

function Task<T>(fork: Fork<T>): ITask<T> {
  return {
    fork,
    ap<U>(other: ITask<(value: T) => U>): ITask<U> {
      return Task<U>((rej, res) => fork(rej, (f) => other.fork(rej, (x) => res(f(x)))));
    },
    map<U>(f: (value: T) => U): ITask<U> {
      return Task<U>((rej, res) => fork(rej, (x) => res(f(x))));
    },
    chain<U>(f: (value: T) => ITask<U>): ITask<U> {
      return Task<U>((rej, res) => fork(rej, (x) => f(x).fork(rej, res)));
    },
    concat(other: ITask<T>): ITask<T> {
      return Task<T>((rej, res) =>
        fork(rej, (x) =>
          other.fork(rej, (y) => {
            console.log('X', x, 'Y', y);
            res((x as any).concat(y));
          })
        )
      );
    },
    fold<U>(f: (value: any) => ITask<U>, g: (value: T) => ITask<U>): ITask<U> {
      return Task<U>((rej, res) =>
        fork(
          (x) => f(x).fork(rej, res),
          (x) => g(x).fork(rej, res)
        )
      );
    },
  };
}

namespace Task {
  export function of<T>(x: T): ITask<T> {
    return Task<T>((rej, res) => res(x));
  }

  export function rejected<T>(x: any): ITask<T> {
    return Task<T>((rej, res) => rej(x));
  }

  export function fromPromised<T, U>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => ITask<T> {
    return (...args: any[]) =>
      Task<T>((rej, res) =>
        fn(...args)
          .then(res)
          .catch(rej)
      );
  }
}

export { Task };
