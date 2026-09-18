/** 半开区间 [arrival, departure) 的时段重叠判断；端点相接不算重叠。 */
export const isTimeOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const sa = Date.parse(startA);
  const ea = Date.parse(endA);
  const sb = Date.parse(startB);
  const eb = Date.parse(endB);
  if ([sa, ea, sb, eb].some(Number.isNaN)) return false;
  return sa < eb && sb < ea;
};
