/**
 * 轻量 hook 垫片：本项目以 Angular 组件为主，没有 React 风格的 hooks 运行时，
 * 这里提供与 hooks 同名的纯函数封装，使 useBerthConflict/useYardMatrix
 * 保持 hook 形态、可在组件中直接复用；计算为派生值，无需缓存。
 */
export function useMemo<T>(factory: () => T, _deps: unknown[]): T {
  return factory();
}
