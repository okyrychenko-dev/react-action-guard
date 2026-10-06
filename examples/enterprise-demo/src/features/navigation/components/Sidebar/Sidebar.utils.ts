export function isNavPathActive(pathname: string, path: string): boolean {
  if (path === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(path);
}
