export interface ObfuscationWindow extends Window {
  _0?: Record<string, string>;
  _2?: Record<string, string>;
}

export function getRoute(name: string): string {
  const routeMap = (window as ObfuscationWindow)._0;
  return routeMap?.[name] ? `/${routeMap[name]}` : `/${name}`;
}

export function getObfId(name: string): string {
  const codeMap = (window as ObfuscationWindow)._2;
  return codeMap?.[name] ?? name;
}
