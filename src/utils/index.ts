export function Omitter<T, K extends keyof T>(
  obj: T,
  keys: K | K[],
): Omit<T, K> {
  const cloneObj = { ...obj };
  const keysAsArray = keys instanceof Array ? keys : [keys];
  keysAsArray.forEach(key => delete cloneObj[key]);
  return cloneObj;
}
