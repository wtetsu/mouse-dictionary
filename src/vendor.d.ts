// Type declarations for dependencies that do not ship their own

declare module "uniqlist" {
  export default class UniqList<T = string> {
    keys: Set<unknown>;
    filter: ((item: T, key: unknown) => boolean) | null;
    get(index: number): T;
    size(): number;
    push(newItem: T, key?: unknown): void;
    merge(anotherArray: readonly T[], keys?: unknown[]): void;
    toArray(): T[];
  }
}

declare module "deinja/build" {
  // Builds a converter that returns the base forms of a Japanese word
  const build: (data: unknown) => (word: string) => string[];
  export default build;
}
