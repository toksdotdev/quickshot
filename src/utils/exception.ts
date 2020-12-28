export class Exception extends Error {
  name: string;

  constructor(message?: string) {
    super(message);

    // Fix prototype
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
