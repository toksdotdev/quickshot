// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockFn = (fn: any) =>
  fn as jest.MockedFunction<typeof fn>;
