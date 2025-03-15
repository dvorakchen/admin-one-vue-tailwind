export function getFileExtension(path: string): string {
  let t = path.split(".");
  return t[t.length - 1];
}
