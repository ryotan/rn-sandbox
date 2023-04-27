export function sleep(ms: number): Promise<void>;
export function sleep<T>(ms: number, callback: () => T): Promise<T>;
export function sleep(ms: number, callback?: () => unknown) {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve(callback?.());
    }, ms),
  );
}
