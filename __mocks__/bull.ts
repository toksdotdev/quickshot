export default class Queue {
  name: string;
  processFn: Function = () => {};

  constructor(name: string) {
    this.name = name;
  }

  process = (concurrency: number, file: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const md = require(require.resolve(file));
    this.processFn = md.default || md;
  };

  add = (data: object): Promise<object> => {
    return this.processFn({ data });
  };
}
