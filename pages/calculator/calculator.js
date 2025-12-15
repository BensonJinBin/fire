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
    
    // 尝试从本地存储恢复用户输入的值
    const savedData = wx.getStorageSync('calculatorData');
    if (savedData) {
      this.setData({
        principal: savedData.principal || this.data.defaultPrincipal,
        income: savedData.income || this.data.defaultIncome,
        expense: savedData.expense || this.data.defaultExpense,
        interestRate: savedData.interestRate || this.data.defaultInterestRate,
        inflationRate: savedData.inflationRate || this.data.defaultInflationRate,
        years: savedData.years || this.data.defaultYears,
        principalInputClass: (savedData.principal !== this.data.defaultPrincipal && savedData.principal) ? 'input' : 'input input-default',
        incomeInputClass: (savedData.income !== this.data.defaultIncome && savedData.income) ? 'input' : 'input input-default',
        expenseInputClass: (savedData.expense !== this.data.defaultExpense && savedData.expense) ? 'input' : 'input input-default',
        interestRateInputClass: (savedData.interestRate !== this.data.defaultInterestRate && savedData.interestRate) ? 'input' : 'input input-default',
        inflationRateInputClass: (savedData.inflationRate !== this.data.defaultInflationRate && savedData.inflationRate) ? 'input' : 'input input-default',
        yearsInputClass: (savedData.years !== this.data.defaultYears && savedData.years) ? 'input' : 'input input-default',
        statusBarHeight: statusBarHeight
      });
    } else {
      this.setData({
        statusBarHeight: statusBarHeight
      });
    }
  },
  
  onShow: function() {
    // 页面显示时可能需要执行的逻辑
  },
  
  onPrincipalInput: function(e) {
    const value = e.detail.value;
    this.setData({
      principal: value,
      principalInputClass: value === this.data.defaultPrincipal || !value ? 'input input-default' : 'input'
    })
  },
  
  onIncomeInput: function(e) {
    const value = e.detail.value;
    this.setData({
      income: value,
      incomeInputClass: value === this.data.defaultIncome || !value ? 'input input-default' : 'input'
    })
  },
  
  onExpenseInput: function(e) {
    const value = e.detail.value;
    this.setData({
      expense: value,
      expenseInputClass: value === this.data.defaultExpense || !value ? 'input input-default' : 'input'
    })
  },
  
  onInterestRateInput: function(e) {
    const value = e.detail.value;
    this.setData({
      interestRate: value,
      interestRateInputClass: value === this.data.defaultInterestRate || !value ? 'input input-default' : 'input'
    })
  },
  
  onInflationRateInput: function(e) {
    const value = e.detail.value;
    this.setData({
      inflationRate: value,
      inflationRateInputClass: value === this.data.defaultInflationRate || !value ? 'input input-default' : 'input'
    })
  },
  
  onYearsInput: function(e) {
    const value = e.detail.value;
    this.setData({
      years: value,
      yearsInputClass: value === this.data.defaultYears || !value ? 'input input-default' : 'input'
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
      years: finalYears,
      principalInputClass: finalPrincipal !== this.data.defaultPrincipal ? 'input' : 'input input-default',
      incomeInputClass: finalIncome !== this.data.defaultIncome ? 'input' : 'input input-default',
      expenseInputClass: finalExpense !== this.data.defaultExpense ? 'input' : 'input input-default',
      interestRateInputClass: finalInterestRate !== this.data.defaultInterestRate ? 'input' : 'input input-default',
      inflationRateInputClass: finalInflationRate !== this.data.defaultInflationRate ? 'input' : 'input input-default',
      yearsInputClass: finalYears !== this.data.defaultYears ? 'input' : 'input input-default'
    });
    
    // 保存用户输入的数据到本地存储
    const calculatorData = {
      principal: finalPrincipal,
      income: finalIncome,
      expense: finalExpense,
      interestRate: finalInterestRate,
      inflationRate: finalInflationRate,
      years: finalYears
    };
    wx.setStorageSync('calculatorData', calculatorData);
    
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
  },
  
  clearInputs: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入并恢复默认值吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地存储
          wx.removeStorageSync('calculatorData');
          
          // 恢复默认值和样式
          this.setData({
            principal: this.data.defaultPrincipal,
            income: this.data.defaultIncome,
            expense: this.data.defaultExpense,
            interestRate: this.data.defaultInterestRate,
            inflationRate: this.data.defaultInflationRate,
            years: this.data.defaultYears,
            principalInputClass: 'input input-default',
            incomeInputClass: 'input input-default',
            expenseInputClass: 'input input-default',
            interestRateInputClass: 'input input-default',
            inflationRateInputClass: 'input input-default',
            yearsInputClass: 'input input-default',
            results: [],
            analysis: []
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  }
})