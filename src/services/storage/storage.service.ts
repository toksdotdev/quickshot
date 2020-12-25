import { Binary } from "crypto";
import { StorageMeta } from "storage-meta";

export interface StorageService {
  /**
   * Upload Binary file to storage.
   * @param content Binary content
   * @param format Binary format
   * @param folder Folder to upload to
   */
  upload(
    content: Binary,
    format?: string,
    folder?: string
  ): Promise<StorageMeta>;
}
