import { uri as uriMatcher } from "@sideway/address";

/**
 * Is URI valid?
 * @param uri
 */
export const isUriValid = (uri: string) =>
  uri.trim().indexOf("file://") < 0 &&
  uri.match(uriMatcher.regex().regex).length > 0;
