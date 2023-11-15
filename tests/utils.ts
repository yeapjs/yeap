export function nano(time) {
  return +time[0] * 1e9 + +time[1];
}