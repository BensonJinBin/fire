// pages/calculator/calculator.js
const util = require('../../utils/util.js');

// 字段默认值映射
const FIELD_DEFAULTS = {
  principal: 'defaultPrincipal',
  income: 'defaultIncome',
  expense: 'defaultExpense',
  saving: 'defaultSaving',
  interestRate: 'defaultInterestRate',
  inflationRate: 'defaultInflationRate',
  years: 'defaultYears'
};

Page({
  data: {
    principal: '100000',
    income: '50000',
    expense: '30000',
    saving: '20000',
    interestRate: '3',
    inflationRate: '2.3',
    years: '10',
    defaultPrincipal: '100000',
    defaultIncome: '50000',
    defaultExpense: '30000',
    defaultSaving: '20000',
    defaultInterestRate: '3',
    defaultInflationRate: '2.3',
    defaultYears: '10',
    principalInputClass: 'input input-default',
    incomeInputClass: 'input input-default',
    expenseInputClass: 'input input-default',
    savingInputClass: 'input input-default',
    interestRateInputClass: 'input input-default',
    inflationRateInputClass: 'input input-default',
    yearsInputClass: 'input input-default',
    results: [],
    analysis: [],
    statusBarHeight: 0,
    isTargetMode: true,
    financeMode: 'expense',
    savingsRate: '40.00',
    calculatedYears: ''
  },

  onLoad: function() {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    const savedData = wx.getStorageSync('calculatorData');

    if (savedData) {
      const financeMode = savedData.financeMode || 'expense';
      const update = { financeMode, statusBarHeight };

      Object.keys(FIELD_DEFAULTS).forEach(field => {
        const defaultKey = FIELD_DEFAULTS[field];
        const saved = savedData[field];
        update[field] = saved || this.data[defaultKey];
        update[field + 'InputClass'] = (saved && saved !== this.data[defaultKey]) ? 'input' : 'input input-default';
      });

      update.isTargetMode = savedData.isTargetMode !== undefined ? savedData.isTargetMode : true;
      this.setData(update);
    } else {
      this.setData({
        saving: this.data.defaultSaving,
        savingInputClass: 'input input-default',
        financeMode: 'expense',
        statusBarHeight
      });
    }

    this.calcSavingsRate();
  },

  // === 通用输入处理 ===

  handleFocus: function(e) {
    const field = e.currentTarget.dataset.field;
    const defaultKey = FIELD_DEFAULTS[field];
    if (this.data[field] === this.data[defaultKey]) {
      this.setData({ [field]: '', [field + 'InputClass']: 'input input-default' });
    } else {
      this.setData({ [field + 'InputClass']: 'input' });
    }
  },

  handleBlur: function(e) {
    const field = e.currentTarget.dataset.field;
    const defaultKey = FIELD_DEFAULTS[field];
    const value = e.detail.value;

    if (!value) {
      this.setData({
        [field]: this.data[defaultKey],
        [field + 'InputClass']: 'input input-default'
      });
    } else {
      let num = parseFloat(value) || 0;
      if (num < 0) {
        num = Math.abs(num);
        this.setData({ [field]: num.toString() });
      }
      this.setData({ [field + 'InputClass']: 'input' });
    }
  },

  handleInput: function(e) {
    const field = e.currentTarget.dataset.field;
    const defaultKey = FIELD_DEFAULTS[field];
    const value = e.detail.value;
    this.setData({
      [field]: value,
      [field + 'InputClass']: (value === this.data[defaultKey] || !value) ? 'input input-default' : 'input'
    });
  },

  // === 储蓄率计算 ===

  calcSavingsRate: function() {
    const income = parseFloat(this.data.income) || 0;
    let expense;

    if (this.data.financeMode === 'expense') {
      expense = parseFloat(this.data.expense) || 0;
    } else {
      expense = income - (parseFloat(this.data.saving) || 0);
    }

    if (income > 0) {
      const rate = ((income - expense) / income) * 100;
      this.setData({ savingsRate: rate < 0 ? 0 : parseFloat(Math.min(100, rate).toFixed(1)) });
    } else {
      this.setData({ savingsRate: 0 });
    }
  },

  recalcSavingFromIncome: function(income) {
    if (this.data.financeMode !== 'expense') return;
    const savingsRate = parseFloat(this.data.savingsRate) || 0;
    const newExpense = income * (1 - savingsRate / 100);
    this.setData({ expense: newExpense.toFixed(2).toString() });
    this.calcSavingsRate();
  },

  // === 有副作用的输入处理 ===

  onIncomeInput: function(e) {
    const value = e.detail.value;
    this.setData({
      income: value,
      incomeInputClass: (value === this.data.defaultIncome || !value) ? 'input input-default' : 'input'
    });
    this.recalcSavingFromIncome(parseFloat(value) || 0);
  },

  onIncomeBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        income: this.data.defaultIncome,
        incomeInputClass: 'input input-default'
      });
      this.recalcSavingFromIncome(parseFloat(this.data.defaultIncome) || 0);
    } else {
      let value = parseFloat(e.detail.value) || 0;
      if (value < 0) { value = Math.abs(value); this.setData({ income: value.toString() }); }
      this.setData({ incomeInputClass: 'input' });
      this.recalcSavingFromIncome(value);
    }
  },

  onExpenseInput: function(e) {
    const value = e.detail.value;
    this.setData({
      expense: value,
      expenseInputClass: (value === this.data.defaultExpense || !value) ? 'input input-default' : 'input'
    });
    if (this.data.financeMode === 'expense') this.calcSavingsRate();
  },

  onExpenseBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        expense: this.data.defaultExpense,
        expenseInputClass: 'input input-default'
      });
    } else {
      let value = parseFloat(e.detail.value) || 0;
      if (value < 0) { value = Math.abs(value); this.setData({ expense: value.toString() }); }
      this.setData({ expenseInputClass: 'input' });
    }
    if (this.data.financeMode === 'expense') this.calcSavingsRate();
  },

  onSavingInput: function(e) {
    const value = e.detail.value;
    this.setData({
      saving: value,
      savingInputClass: (value === this.data.defaultSaving || !value) ? 'input input-default' : 'input'
    });
    this.calcSavingsRate();
  },

  onSavingBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        saving: this.data.defaultSaving,
        savingInputClass: 'input input-default'
      });
    } else {
      let value = parseFloat(e.detail.value) || 0;
      if (value < 0) { value = Math.abs(value); this.setData({ saving: value.toString() }); }
      this.setData({ savingInputClass: 'input' });
    }
    if (this.data.financeMode === 'saving') this.calcSavingsRate();
  },

  // === 模式切换 ===

  onFinanceModeChange: function(e) {
    const selectedMode = e.detail.value;
    const currentData = wx.getStorageSync('calculatorData') || {};
    currentData.financeMode = selectedMode;

    if (selectedMode !== this.data.financeMode) {
      const isTargetMode = selectedMode === 'expense';
      this.setData({ financeMode: selectedMode, isTargetMode });
      currentData.isTargetMode = isTargetMode;
    } else {
      this.setData({ financeMode: selectedMode });
    }

    wx.setStorageSync('calculatorData', currentData);
    this.calcSavingsRate();
  },

  onModeChange: function(e) {
    const isTargetMode = (e.detail.value === 'target');
    this.setData({ isTargetMode });
    const currentData = wx.getStorageSync('calculatorData') || {};
    currentData.isTargetMode = isTargetMode;
    wx.setStorageSync('calculatorData', currentData);
  },

  onSavingsRateChange: function(e) {
    let newRate = Math.round(e.detail.value / 10) * 10;
    newRate = Number(Math.min(100, Math.max(0, newRate)).toFixed(1));
    const income = parseFloat(this.data.income) || 0;

    if (this.data.financeMode === 'expense') {
      const newExpense = income * (1 - newRate / 100);
      this.setData({ savingsRate: newRate, expense: newExpense.toFixed(2).toString() });
    } else {
      const newSaving = income * (newRate / 100);
      this.setData({ savingsRate: newRate, saving: newSaving.toFixed(2).toString() });
    }
  },

  // === 计算逻辑 ===

  calculate: function() {
    let finalIncome, finalExpense;

    if (this.data.financeMode === 'expense') {
      finalIncome = parseFloat(this.data.income === '' ? this.data.defaultIncome : this.data.income);
      finalExpense = parseFloat(this.data.expense === '' ? this.data.defaultExpense : this.data.expense);

      if (finalExpense > finalIncome) {
        wx.showModal({
          title: '提示',
          content: '年支出大于年收入，是否继续计算?',
          success: (res) => { if (res.confirm) this.performCalculation(finalIncome, finalExpense); }
        });
        return;
      }
    } else {
      const saving = parseFloat(this.data.saving === '' ? this.data.defaultSaving : this.data.saving);
      if (saving < 0) {
        wx.showToast({ title: '年储蓄不能为负数', icon: 'none' });
        return;
      }
      finalIncome = saving;
      finalExpense = 0;
    }

    this.performCalculation(finalIncome, finalExpense);
  },

  performCalculation: function(finalIncome, finalExpense) {
    finalExpense = finalExpense.toString();
    const { principal, interestRate, inflationRate, years,
            defaultPrincipal, defaultInterestRate, defaultInflationRate, defaultYears, isTargetMode } = this.data;

    const finalPrincipal = (principal === '' || principal === defaultPrincipal) ? defaultPrincipal : principal;
    const finalInterestRate = (interestRate === '' || interestRate === defaultInterestRate) ? defaultInterestRate : interestRate;
    const finalInflationRate = (inflationRate === '' || inflationRate === defaultInflationRate) ? defaultInflationRate : inflationRate;

    const principalNum = parseFloat(finalPrincipal);
    const incomeNum = parseFloat(finalIncome);
    const expenseNum = parseFloat(finalExpense);
    const interestRateNum = parseFloat(finalInterestRate) / 100;
    const inflationRateNum = parseFloat(finalInflationRate) / 100;

    if (isNaN(principalNum) || isNaN(incomeNum) || isNaN(expenseNum) ||
        isNaN(interestRateNum) || isNaN(inflationRateNum)) {
      wx.showToast({ title: '请输入有效数字', icon: 'none' });
      return;
    }
    if (principalNum < 0 || incomeNum < 0 || expenseNum < 0 ||
        interestRateNum < 0 || inflationRateNum < 0) {
      wx.showToast({ title: '输入值不能为负数', icon: 'none' });
      return;
    }

    let results;
    if (isTargetMode) {
      results = this.calculateTargetMode(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum);
    } else {
      const yearsNum = parseInt(years === '' || years === defaultYears ? defaultYears : years);
      if (isNaN(yearsNum)) {
        wx.showToast({ title: '请输入有效数字', icon: 'none' });
        return;
      }
      results = this.calculatePredictionMode(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum, yearsNum);
    }

    const analysis = this.analyzeResults(results, expenseNum, incomeNum, interestRateNum, inflationRateNum);

    // 构建更新数据
    const updateData = {
      results,
      analysis,
      principal: finalPrincipal,
      interestRate: finalInterestRate,
      inflationRate: finalInflationRate,
      principalInputClass: finalPrincipal !== defaultPrincipal ? 'input' : 'input input-default',
      interestRateInputClass: finalInterestRate !== defaultInterestRate ? 'input' : 'input input-default',
      inflationRateInputClass: finalInflationRate !== defaultInflationRate ? 'input' : 'input input-default'
    };

    if (isTargetMode) {
      updateData.calculatedYears = results.length.toString();
    } else {
      const finalYears = (years === '' || years === defaultYears) ? defaultYears : years;
      updateData.years = finalYears;
      updateData.yearsInputClass = finalYears !== defaultYears ? 'input' : 'input input-default';
    }

    if (this.data.financeMode === 'expense') {
      updateData.income = finalIncome.toString();
      updateData.expense = finalExpense;
      updateData.incomeInputClass = finalIncome.toString() !== this.data.defaultIncome ? 'input' : 'input input-default';
      const defaultExpenseVal = (parseFloat(this.data.defaultIncome) - parseFloat(this.data.defaultSaving)).toString();
      updateData.expenseInputClass = finalExpense !== defaultExpenseVal ? 'input' : 'input input-default';
    } else {
      updateData.saving = this.data.saving;
      updateData.savingInputClass = this.data.saving !== this.data.defaultSaving ? 'input' : 'input input-default';
    }

    this.setData(updateData);

    // 保存到本地存储
    wx.setStorageSync('calculatorData', {
      principal: finalPrincipal,
      income: finalIncome.toString(),
      expense: finalExpense,
      saving: this.data.saving,
      interestRate: finalInterestRate,
      inflationRate: finalInflationRate,
      years,
      isTargetMode,
      financeMode: this.data.financeMode
    });

    wx.showToast({ title: '计算完成', icon: 'success' });

    this.setData({ scrollToResult: true });
    setTimeout(() => {
      wx.pageScrollTo({ selector: '#results-placeholder', duration: 300 });
    }, 100);
  },

  // 预测模式计算
  calculatePredictionMode: function(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum, yearsNum) {
    let currentPrincipal = principalNum;
    let currentExpense = expenseNum;
    const results = [];
    const isSavingMode = this.data.financeMode === 'saving';
    const displayValue = isSavingMode ? incomeNum : expenseNum;

    for (let i = 0; i < yearsNum; i++) {
      const interest = util.multiply(currentPrincipal, interestRateNum);
      const newPrincipal = util.add(util.add(util.subtract(currentPrincipal, currentExpense), incomeNum), interest);

      results.push({
        year: i + 1,
        expense: util.toFixed2(isSavingMode ? displayValue : currentExpense),
        interest: util.toFixed2(interest),
        principal: util.toFixed2(newPrincipal)
      });

      currentPrincipal = newPrincipal;
      if (!isSavingMode) {
        currentExpense = util.multiply(currentExpense, (1 + inflationRateNum));
      }
    }

    return results;
  },

  // 目标模式计算（计算达到财务自由需要多少年）
  calculateTargetMode: function(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum) {
    let currentPrincipal = principalNum;
    let currentExpense = expenseNum;
    const results = [];
    const maxYears = 100;
    const isSavingMode = this.data.financeMode === 'saving';
    const displayValue = isSavingMode ? incomeNum : expenseNum;

    for (let year = 0; year < maxYears; year++) {
      const interest = util.multiply(currentPrincipal, interestRateNum);
      const newPrincipal = util.add(util.add(util.subtract(currentPrincipal, currentExpense), incomeNum), interest);

      results.push({
        year: year + 1,
        expense: util.toFixed2(isSavingMode ? displayValue : currentExpense),
        interest: util.toFixed2(interest),
        principal: util.toFixed2(newPrincipal)
      });

      if (interest >= currentExpense) break;

      // 本金耗尽，无法达成目标
      if (newPrincipal <= 0) {
        wx.showModal({
          title: '无法达成目标',
          content: '按当前参数，本金将在第' + (year + 1) + '年耗尽。建议提高收入、降低支出或提高投资回报率。',
          showCancel: false
        });
        break;
      }

      currentPrincipal = newPrincipal;
      if (!isSavingMode) {
        currentExpense = util.multiply(currentExpense, (1 + inflationRateNum));
      }
    }

    return results;
  },

  analyzeResults: function(results, initialExpense, income, interestRate, inflationRate) {
    if (results.length === 0) return [];

    const analysis = [];
    const finalResult = results[results.length - 1];
    const lastPrincipal = finalResult.principal;
    const lastExpense = finalResult.expense;
    const actualPrincipal = this.data.principal === this.data.defaultPrincipal ? this.data.defaultPrincipal : this.data.principal;

    if (lastPrincipal > parseFloat(actualPrincipal)) {
      analysis.push(`经过${results.length}年，您的本金从${actualPrincipal}元增长到了${lastPrincipal}元，增长了${((lastPrincipal / actualPrincipal - 1) * 100).toFixed(2)}%。`);
    } else {
      analysis.push(`经过${results.length}年，您的本金从${actualPrincipal}元变化到了${lastPrincipal}元。`);
    }

    const lastInterest = finalResult.interest;

    if (this.data.financeMode === 'expense') {
      if (lastInterest >= lastExpense) {
        analysis.push(`恭喜！在最后一年，您的投资收益(${lastInterest}元)已经能够覆盖您的年度支出(${lastExpense}元)，达到了Fire的基本条件！`);
      } else {
        analysis.push(`在最后一年，您的投资收益(${lastInterest}元)尚不能完全覆盖年度支出(${lastExpense}元)，还需要继续积累。`);
      }

      if (inflationRate > 0) {
        const expenseIncrease = ((lastExpense / initialExpense - 1) * 100).toFixed(2);
        analysis.push(`由于通胀(${(inflationRate * 100).toFixed(2)}%)的影响，${results.length}年后您的年度支出增长了${expenseIncrease}%。`);
      }

      analysis.push('建议：提高储蓄率、优化投资组合、控制生活成本，有助于更快实现Fire目标。');
    } else {
      analysis.push(`在最后一年，您的投资收益为${lastInterest}元。`);

      const totalInterest = results.reduce((sum, r) => sum + parseFloat(r.interest), 0);
      analysis.push(`${results.length}年间，您的投资总收益为${totalInterest.toFixed(2)}元。`);

      if (interestRate * 100 > inflationRate * 100) {
        analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)高于通胀率(${(inflationRate * 100).toFixed(2)}%)，资产实际价值在增长。`);
      } else {
        analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)低于或等于通胀率(${(inflationRate * 100).toFixed(2)}%)，需要注意资产的保值增值。`);
      }

      analysis.push('建议：保持稳定的储蓄习惯、优化投资组合，有助于资产持续增长。');
    }

    return analysis;
  },

  clearInputs: function() {
    const currentTargetMode = this.data.isTargetMode;
    const currentFinanceMode = this.data.financeMode;

    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入并恢复默认值吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('calculatorData');

          const reset = {
            results: [],
            analysis: [],
            calculatedYears: '',
            savingsRate: '40.00',
            isTargetMode: currentTargetMode,
            financeMode: currentFinanceMode
          };

          Object.keys(FIELD_DEFAULTS).forEach(field => {
            const defaultKey = FIELD_DEFAULTS[field];
            reset[field] = this.data[defaultKey];
            reset[field + 'InputClass'] = 'input input-default';
          });

          this.setData(reset);
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: 'FIRE Calculator - 财务自由计算器',
      path: '/pages/calculator/calculator',
      imageUrl: '/images/share/share.jpg'
    };
  },

  onShareTimeline: function() {
    return {
      title: 'FIRE Calculator - 财务自由计算器',
      query: '',
      imageUrl: '/images/share/share.jpg'
    };
  }
})
