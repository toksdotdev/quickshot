import { Binary } from "crypto";
import { AppConfig } from "config";
import { StorageMeta } from "storage-meta";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

class StorageService {
  constructor(config: AppConfig) {
    /* eslint-disable @typescript-eslint/camelcase*/
    cloudinary.config({
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      cloud_name: config.cloudinary.cloudName,
    });
    /*eslint-enable */
  }

  /**
   * Upload Binary file to storage.
   * @param content Binary content
   * @param format Binary format
   * @param folder Folder to upload to
   */
  public async upload(
    content: Binary,
    format: string = "png",
    folder?: string
  ): Promise<StorageMeta> {
    const response: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, format },
        (err, meta) => (err ? reject(err) : resolve(meta))
      );

      stream.end(content);
    });

    return { url: response.url };
  }
}

export default StorageService;
