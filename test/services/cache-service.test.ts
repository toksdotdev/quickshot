import { CacheService } from "../../src/services/cache";

describe("Cache Service", () => {
  let cacheService: CacheService & { store: object };

  beforeEach(() => {
    cacheService = {
      store: new Map(),
      set: function (key: string, value: string) {
        this.store[key] = value;
      },
      get: function (key: string) {
        return this.store[key];
      },
    };
  });

  test("Should should able to store & get value from cache", async (done) => {
    cacheService.set("hello", "world");
    expect(await cacheService.get("hello")).toEqual("world");
    done();
  });
});
