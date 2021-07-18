export function prefixObjProperties(prefix: string, obj: Record<string, any>) {
  const collected: Record<string, any> = {};

  for (const key in obj) {
    const val = obj[key];
    collected[`${prefix}.${key}`] = val;
  }

  return collected;
}
