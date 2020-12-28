import { uri as uriMatcher, email as emailMatcher } from "@sideway/address";

/**
 * Is URI valid?
 * @param uri
 */
export const isUriValid = (uri: string) => {
  if (uri.trim().indexOf("file://") >= 0) return false;
  const matches = uri.match(uriMatcher.regex().regex);
  return matches && matches.length > 0;
};

/**
 * Is email valid?
 * @param email Email
 */
export const isEmailValid = (email: string) =>
  email && emailMatcher.isValid(email);
