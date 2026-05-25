const util = require('../utils/util');

describe('toFixed2', () => {
  test('正常四舍五入', () => {
    expect(util.toFixed2(3.146)).toBe(3.15);
    expect(util.toFixed2(3.144)).toBe(3.14);
    expect(util.toFixed2(3.145)).toBe(3.15);
  });

  test('已是两位小数', () => {
    expect(util.toFixed2(3.14)).toBe(3.14);
  });

  test('整数', () => {
    expect(util.toFixed2(5)).toBe(5);
  });

  test('零', () => {
    expect(util.toFixed2(0)).toBe(0);
  });

  test('负数', () => {
    expect(util.toFixed2(-3.146)).toBe(-3.15);
    expect(util.toFixed2(-3.144)).toBe(-3.14);
  });

  test('NaN 返回 0', () => {
    expect(util.toFixed2(NaN)).toBe(0);
    expect(util.toFixed2(undefined)).toBe(0);
    expect(util.toFixed2('abc')).toBe(0);
  });

  test('极小值', () => {
    expect(util.toFixed2(0.001)).toBe(0);
    expect(util.toFixed2(0.005)).toBe(0.01);
  });
});

describe('add', () => {
  test('经典浮点问题 0.1 + 0.2', () => {
    expect(util.add(0.1, 0.2)).toBe(0.3);
  });

  test('整数加法', () => {
    expect(util.add(1, 2)).toBe(3);
  });

  test('含负数', () => {
    expect(util.add(-1, 2)).toBe(1);
    expect(util.add(-1, -2)).toBe(-3);
  });

  test('加零', () => {
    expect(util.add(5, 0)).toBe(5);
    expect(util.add(0, 5)).toBe(5);
  });

  test('大数加法', () => {
    expect(util.add(100000, 50000)).toBe(150000);
  });

  test('小数加法', () => {
    expect(util.add(0.01, 0.02)).toBe(0.03);
  });

  test('FIRE 场景：本金 + 收入', () => {
    expect(util.add(100000, 50000)).toBe(150000);
  });
});

describe('subtract', () => {
  test('经典浮点问题 0.3 - 0.1', () => {
    expect(util.subtract(0.3, 0.1)).toBe(0.2);
  });

  test('整数减法', () => {
    expect(util.subtract(3, 1)).toBe(2);
  });

  test('结果为负', () => {
    expect(util.subtract(1, 3)).toBe(-2);
  });

  test('减零', () => {
    expect(util.subtract(5, 0)).toBe(5);
  });

  test('相同值', () => {
    expect(util.subtract(5, 5)).toBe(0);
  });

  test('大数减法', () => {
    expect(util.subtract(100000, 30000)).toBe(70000);
  });

  test('FIRE 场景：本金 - 支出', () => {
    expect(util.subtract(100000, 30000)).toBe(70000);
  });
});

describe('multiply', () => {
  test('经典浮点问题 0.1 * 0.3', () => {
    expect(util.multiply(0.1, 0.3)).toBe(0.03);
  });

  test('整数乘法', () => {
    expect(util.multiply(3, 4)).toBe(12);
  });

  test('乘零', () => {
    expect(util.multiply(5, 0)).toBe(0);
    expect(util.multiply(0, 5)).toBe(0);
  });

  test('负数', () => {
    expect(util.multiply(-2, 3)).toBe(-6);
    expect(util.multiply(-2, -3)).toBe(6);
  });

  test('FIRE 场景：本金 * 利率', () => {
    expect(util.multiply(100000, 0.03)).toBe(3000);
    expect(util.multiply(758785, 0.03)).toBe(22763.55);
  });

  test('FIRE 场景：支出 * (1+通胀率)', () => {
    expect(util.multiply(30000, 1.023)).toBe(30690);
  });

  test('小数乘法', () => {
    expect(util.multiply(0.01, 0.03)).toBe(0);
    expect(util.multiply(100, 0.03)).toBe(3);
  });
});

describe('FIRE 计算链路', () => {
  test('第一年完整计算', () => {
    const principal = 100000;
    const income = 50000;
    const expense = 30000;
    const rate = 0.03;

    const interest = util.multiply(principal, rate);
    const afterExpense = util.subtract(principal, expense);
    const afterIncome = util.add(afterExpense, income);
    const newPrincipal = util.add(afterIncome, interest);

    expect(interest).toBe(3000);
    expect(newPrincipal).toBe(123000);
  });

  test('支出通胀增长', () => {
    const expense = 30000;
    const inflation = 0.023;

    const year2 = util.multiply(expense, 1 + inflation);
    expect(year2).toBe(30690);

    const year3 = util.multiply(year2, 1 + inflation);
    expect(year3).toBe(31395.87);
  });
});
