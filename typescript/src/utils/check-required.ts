export function checkRequired<T>(value: T, name: string) {
  if (value === null || value === undefined) {
    throw new Error(`\`${name}\` is required`);
  }

  return value as NonNullable<T>;
}
