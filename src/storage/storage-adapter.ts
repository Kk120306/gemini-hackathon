export interface StorageAdapter<T> {
  load(): T | null;
  save(value: T): void;
  clear(): void;
}
