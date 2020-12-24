import { uri as uriMatcher} from "@sideway/address";

/**
 * Is URI valid?
 * @param uri
 */
export const isUriValid = (uri: string) => uri.match(uriMatcher.regex().regex).length > 0;
