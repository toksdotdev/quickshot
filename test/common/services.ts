import { CacheService } from "../../src/services/cache/cache.service";
import { StorageService } from "../../src/services/storage/storage.service";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";

export const mockQueueService = () => ({
  add: jest.fn(),
  register: jest.fn(),
});

export const mockCacheService = (a: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImpl?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getImpl?: any;
}) => ({
  set: jest.fn().mockImplementation(a.setImpl),
  get: jest.fn().mockImplementation(a.getImpl),
});

export const mockStorageService = ({ uploadResponse = null }) =>
  ({
    upload: jest.fn().mockReturnValue(uploadResponse),
  } as StorageService);

export const mockScreenshotService = ({
  cacheService = mockCacheService({}) as CacheService,
  storageService = mockStorageService({}) as StorageService,
}) => new ScreenshotService(cacheService, storageService);
