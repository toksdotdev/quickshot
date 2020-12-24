export class Exception extends Error {
  name = "INVALID_URL";

  constructor(message?: string) {
    super(message);

    // Fix prototype
    const proto = new.target.prototype;
    const setPrototypeOf: Function = Object.setPrototypeOf;
    setPrototypeOf
      ? setPrototypeOf(this, proto)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((this as any).__proto__ = proto);

    // Capture stack trace
    const captureStackTrace: Function = Error.captureStackTrace;
    captureStackTrace && captureStackTrace(this, this.constructor);
  }
}
