export class Exception extends Error {
  name = "INVALID_URL";

  constructor(message?: string) {
    super(message);

    // Fix prototype
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
