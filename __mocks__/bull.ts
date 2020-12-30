export default class Queue {
  name: string;
  processFn: Function = () => {};

  constructor(name: string) {
    this.name = name;
  }

  process = async (concurrency: number, callback: Function) => {
    this.processFn = callback;
  };

  add = (data: object): Promise<object> => {
    return new Promise((resolve, reject) => {
      this.processFn(data, (err: object, res: object) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };
}
