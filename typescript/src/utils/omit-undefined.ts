export const omitUndefined = (value: object) => {
  return Object.fromEntries(
    Object.entries(value).filter(([_, v]) => v !== undefined)
  );
};
