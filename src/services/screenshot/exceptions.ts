import { Exception } from "../../utils/exception";

export class InvalidUrlException extends Exception {
  public name = "INVALID_URL";
  public code = 400;

  constructor(public url?: string) {
    super(`Invalid URL: ${url}`);
  }
}
