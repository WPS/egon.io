export function isPresent<T>(value: T): value is T {
  return value !== null && value !== undefined;
}
