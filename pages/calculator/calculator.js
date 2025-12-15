// pages/calculator/calculator.js
const util = require('../../utils/util.js');

Page({
  data: {
    principal: '100000',
    income: '50000',
    expense: '30000',
    interestRate: '7',
    inflationRate: '2.3',
    years: '10',
    defaultPrincipal: '100000',
    defaultIncome: '50000',
    defaultExpense: '30000',
    defaultInterestRate: '7',
    defaultInflationRate: '2.3',
    defaultYears: '10',
    principalInputClass: 'input input-default',
    incomeInputClass: 'input input-default',
    expenseInputClass: 'input input-default',
    interestRateInputClass: 'input input-default',
    inflationRateInputClass: 'input input-default',
    yearsInputClass: 'input input-default',
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
  
  onPrincipalFocus: function(e) {
    if (this.data.principal === this.data.defaultPrincipal) {
      this.setData({
        principal: '',
        principalInputClass: 'input'
      })
    } else {
      this.setData({
        principalInputClass: 'input'
      })
    }
  },
  
  onPrincipalBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        principal: this.data.defaultPrincipal,
        principalInputClass: 'input input-default'
      })
    } else {
      this.setData({
        principalInputClass: 'input'
      })
    }
  },
  
  onIncomeFocus: function(e) {
    if (this.data.income === this.data.defaultIncome) {
      this.setData({
        income: '',
        incomeInputClass: 'input'
      })
    } else {
      this.setData({
        incomeInputClass: 'input'
      })
    }
  },
  
  onIncomeBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        income: this.data.defaultIncome,
        incomeInputClass: 'input input-default'
      })
    } else {
      this.setData({
        incomeInputClass: 'input'
      })
    }
  },
  
  onExpenseFocus: function(e) {
    if (this.data.expense === this.data.defaultExpense) {
      this.setData({
        expense: '',
        expenseInputClass: 'input'
      })
    } else {
      this.setData({
        expenseInputClass: 'input'
      })
    }
  },
  
  onExpenseBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        expense: this.data.defaultExpense,
        expenseInputClass: 'input input-default'
      })
    } else {
      this.setData({
        expenseInputClass: 'input'
      })
    }
  },
  
  onInterestRateFocus: function(e) {
    if (this.data.interestRate === this.data.defaultInterestRate) {
      this.setData({
        interestRate: '',
        interestRateInputClass: 'input'
      })
    } else {
      this.setData({
        interestRateInputClass: 'input'
      })
    }
  },
  
  onInterestRateBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        interestRate: this.data.defaultInterestRate,
        interestRateInputClass: 'input input-default'
      })
    } else {
      this.setData({
        interestRateInputClass: 'input'
      })
    }
  },
  
  onInflationRateFocus: function(e) {
    if (this.data.inflationRate === this.data.defaultInflationRate) {
      this.setData({
        inflationRate: '',
        inflationRateInputClass: 'input'
      })
    } else {
      this.setData({
        inflationRateInputClass: 'input'
      })
    }
  },
  
  onInflationRateBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        inflationRate: this.data.defaultInflationRate,
        inflationRateInputClass: 'input input-default'
      })
    } else {
      this.setData({
        inflationRateInputClass: 'input'
      })
    }
  },
  
  onYearsFocus: function(e) {
    if (this.data.years === this.data.defaultYears) {
      this.setData({
        years: '',
        yearsInputClass: 'input'
      })
    } else {
      this.setData({
        yearsInputClass: 'input'
      })
    }
  },
  
  onYearsBlur: function(e) {
    if (!e.detail.value) {
      this.setData({
        years: this.data.defaultYears,
        yearsInputClass: 'input input-default'
      })
    } else {
      this.setData({
        yearsInputClass: 'input'
      })
    }
  },
  
  calculate: function() {
    const { principal, income, expense, interestRate, inflationRate, years, 
            defaultPrincipal, defaultIncome, defaultExpense, 
            defaultInterestRate, defaultInflationRate, defaultYears } = this.data;
    
    // 使用默认值填充空字段
    const finalPrincipal = (principal === '' || principal === defaultPrincipal) ? defaultPrincipal : principal;
    const finalIncome = (income === '' || income === defaultIncome) ? defaultIncome : income;
    const finalExpense = (expense === '' || expense === defaultExpense) ? defaultExpense : expense;
    const finalInterestRate = (interestRate === '' || interestRate === defaultInterestRate) ? defaultInterestRate : interestRate;
    const finalInflationRate = (inflationRate === '' || inflationRate === defaultInflationRate) ? defaultInflationRate : inflationRate;
    const finalYears = (years === '' || years === defaultYears) ? defaultYears : years;
    
    const principalNum = parseFloat(finalPrincipal);
    const incomeNum = parseFloat(finalIncome);
    const expenseNum = parseFloat(finalExpense);
    const interestRateNum = parseFloat(finalInterestRate) / 100;
    const inflationRateNum = parseFloat(finalInflationRate) / 100;
    const yearsNum = parseInt(finalYears);
    
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
      analysis: analysis,
      principal: finalPrincipal,
      income: finalIncome,
      expense: finalExpense,
      interestRate: finalInterestRate,
      inflationRate: finalInflationRate,
      years: finalYears
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
    
    // 获取当前实际使用的值
    const actualPrincipal = this.data.principal === this.data.defaultPrincipal ? this.data.defaultPrincipal : this.data.principal;
    
    // 分析本金变化
    if (lastPrincipal > parseFloat(actualPrincipal)) {
      analysis.push(`经过${results.length}年，您的本金从${actualPrincipal}元增长到了${lastPrincipal}元，增长了${((lastPrincipal/actualPrincipal - 1) * 100).toFixed(2)}%。`);
    } else {
      analysis.push(`经过${results.length}年，您的本金从${actualPrincipal}元变化到了${lastPrincipal}元。`);
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