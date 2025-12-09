// utils/util.js
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 保留两位小数，不进行四舍五入，直接截取
const toFixed2 = (num) => {
  if (isNaN(num)) return 0;
  const multiplier = 100;
  return Math.round(num * multiplier) / multiplier;
}

// 加法，避免浮点数计算误差
const add = (a, b) => {
  const multiplier = 100;
  const result = (a * multiplier + b * multiplier) / multiplier;
  return toFixed2(result);
}

// 减法，避免浮点数计算误差
const subtract = (a, b) => {
  const multiplier = 100;
  const result = (a * multiplier - b * multiplier) / multiplier;
  return toFixed2(result);
}

// 乘法，避免浮点数计算误差
const multiply = (a, b) => {
  const multiplier = 10000;
  const result = (a * multiplier * b) / multiplier;
  return toFixed2(result);
}

module.exports = {
  formatNumber,
  toFixed2,
  add,
  subtract,
  multiply
}