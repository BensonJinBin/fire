// pages/calculator/calculator.js
const util = require('../../utils/util.js');

Page({
  data: {
    principal: '',
    income: '',
    expense: '',
    interestRate: '',
    inflationRate: '',
    years: '',
    results: [],
    analysis: [],
    statusBarHeight: 0
  },
  
  onLoad: function() {
    // 获取系统信息以适配不同设备的状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    this.setData({
      statusBarHeight: statusBarHeight
    });
  },
  
  onShow: function() {
    // 页面显示时可能需要执行的逻辑
  },
  
  onPrincipalInput: function(e) {
    this.setData({
      principal: e.detail.value
    })
  },
  
  onIncomeInput: function(e) {
    this.setData({
      income: e.detail.value
    })
  },
  
  onExpenseInput: function(e) {
    this.setData({
      expense: e.detail.value
    })
  },
  
  onInterestRateInput: function(e) {
    this.setData({
      interestRate: e.detail.value
    })
  },
  
  onInflationRateInput: function(e) {
    this.setData({
      inflationRate: e.detail.value
    })
  },
  
  onYearsInput: function(e) {
    this.setData({
      years: e.detail.value
    })
  },
  
  calculate: function() {
    const { principal, income, expense, interestRate, inflationRate, years } = this.data;
    
    // 验证输入数据
    if (!principal || !income || !expense || !interestRate || !inflationRate || !years) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none'
      });
      return;
    }
    
    const principalNum = parseFloat(principal);
    const incomeNum = parseFloat(income);
    const expenseNum = parseFloat(expense);
    const interestRateNum = parseFloat(interestRate) / 100;
    const inflationRateNum = parseFloat(inflationRate) / 100;
    const yearsNum = parseInt(years);
    
    if (isNaN(principalNum) || isNaN(incomeNum) || isNaN(expenseNum) || 
        isNaN(interestRateNum) || isNaN(inflationRateNum) || isNaN(yearsNum)) {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      });
      return;
    }
    
    // 计算年度支出变化（考虑通胀）
    let currentPrincipal = principalNum;
    let currentExpense = expenseNum;
    let results = [];
    
    for (let i = 0; i < yearsNum; i++) {
      // 计算当前年的利息
      const interest = util.multiply(currentPrincipal, interestRateNum);
      
      // 计算年末本金：年初本金 + 收入 - 支出 + 利息
      const newPrincipal = util.add(util.add(util.subtract(currentPrincipal, currentExpense), incomeNum), interest);
      
      // 记录当前年份结果
      results.push({
        year: i + 1,
        expense: util.toFixed2(currentExpense),
        interest: util.toFixed2(interest),
        principal: util.toFixed2(newPrincipal)
      });
      
      // 更新本金用于下一年计算
      currentPrincipal = newPrincipal;
      
      // 更新支出（考虑通胀）
      currentExpense = util.multiply(currentExpense, (1 + inflationRateNum));
    }
    
    // 进行分析
    const analysis = this.analyzeResults(results, expenseNum, incomeNum, interestRateNum, inflationRateNum);
    
    this.setData({
      results: results,
      analysis: analysis
    });
    
    wx.showToast({
      title: '计算完成',
      icon: 'success'
    });
  },
  
  analyzeResults: function(results, initialExpense, income, interestRate, inflationRate) {
    if (results.length === 0) return [];
    
    const analysis = [];
    const finalResult = results[results.length - 1];
    const lastPrincipal = finalResult.principal;
    const lastExpense = finalResult.expense;
    
    // 分析本金变化
    if (lastPrincipal > parseFloat(this.data.principal)) {
      analysis.push(`经过${results.length}年，您的本金从${this.data.principal}元增长到了${lastPrincipal}元，增长了${((lastPrincipal/this.data.principal - 1) * 100).toFixed(2)}%。`);
    } else {
      analysis.push(`经过${results.length}年，您的本金从${this.data.principal}元变化到了${lastPrincipal}元。`);
    }
    
    // 分析收入与支出关系
    const lastInterest = finalResult.interest;
    if (lastInterest >= lastExpense) {
      analysis.push(`恭喜！在最后一年，您的投资收益(${lastInterest}元)已经能够覆盖您的年度支出(${lastExpense}元)，达到了Fire的基本条件！`);
    } else {
      analysis.push(`在最后一年，您的投资收益(${lastInterest}元)尚不能完全覆盖年度支出(${lastExpense}元)，还需要继续积累。`);
    }
    
    // 分析通胀影响
    if (inflationRate > 0) {
      const expenseIncrease = ((lastExpense / initialExpense - 1) * 100).toFixed(2);
      analysis.push(`由于通胀(${(inflationRate * 100).toFixed(2)}%)的影响，${results.length}年后您的年度支出增长了${expenseIncrease}%。`);
    }
    
    // 投资回报率分析
    if (interestRate * 100 > inflationRate * 100) {
      analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)高于通胀率(${(inflationRate * 100).toFixed(2)}%)，资产实际价值在增长。`);
    } else {
      analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)低于或等于通胀率(${(inflationRate * 100).toFixed(2)}%)，需要注意资产的保值增值。`);
    }
    
    // 提供建议
    analysis.push('建议：提高储蓄率、优化投资组合、控制生活成本，有助于更快实现Fire目标。');
    
    return analysis;
  },
  
  // 导航到首页
  navigateToIndex: function() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  
  // 导航到个人页面
  navigateToProfile: function() {
    wx.redirectTo({
      url: '/pages/profile/profile'
    });
  }
})