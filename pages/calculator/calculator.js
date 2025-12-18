// pages/calculator/calculator.js
const util = require('../../utils/util.js');

Page({
  data: {
    principal: '100000',
    income: '50000',
    expense: '30000',
    saving: '20000', // 新增：年储蓄
    interestRate: '3',
    inflationRate: '2.3',
    years: '10',
    defaultPrincipal: '100000',
    defaultIncome: '50000',
    defaultExpense: '30000',
    defaultSaving: '20000', // 新增：默认年储蓄
    defaultInterestRate: '3',
    defaultInflationRate: '2.3',
    defaultYears: '10',
    principalInputClass: 'input input-default',
    incomeInputClass: 'input input-default',
    expenseInputClass: 'input input-default',
    savingInputClass: 'input input-default', // 新增：储蓄输入框样式
    interestRateInputClass: 'input input-default',
    inflationRateInputClass: 'input input-default',
    yearsInputClass: 'input input-default',
    results: [],
    analysis: [],
    statusBarHeight: 0,
    isTargetMode: true, // 是否为目标模式
    financeMode: 'expense', // 财务模式：expense(支出模式) 或 saving(储蓄模式)
    savingsRate: '40.00', // 储蓄率，根据年收入和年支出/储蓄计算
    calculatedYears: '' // 目标模式下计算得出的年数
  },
  
  onLoad: function() {
    // 获取系统信息以适配不同设备的状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    
    // 尝试从本地存储恢复用户输入的值
    const savedData = wx.getStorageSync('calculatorData');
    if (savedData) {
      // 如果保存的数据中没有financeMode，设置默认为'expense'
      const financeMode = savedData.financeMode || 'expense';
      
      // 根据保存的模式设置数据
      this.setData({
        principal: savedData.principal || this.data.defaultPrincipal,
        income: savedData.income || this.data.defaultIncome,
        expense: savedData.expense || this.data.defaultExpense,
        saving: savedData.saving || this.data.defaultSaving,
        interestRate: savedData.interestRate || this.data.defaultInterestRate,
        inflationRate: savedData.inflationRate || this.data.defaultInflationRate,
        years: savedData.years || this.data.defaultYears,
        principalInputClass: (savedData.principal !== this.data.defaultPrincipal && savedData.principal) ? 'input' : 'input input-default',
        incomeInputClass: (savedData.income !== this.data.defaultIncome && savedData.income) ? 'input' : 'input input-default',
        expenseInputClass: (savedData.expense !== this.data.defaultExpense && savedData.expense) ? 'input' : 'input input-default',
        savingInputClass: (savedData.saving !== this.data.defaultSaving && savedData.saving) ? 'input' : 'input input-default',
        interestRateInputClass: (savedData.interestRate !== this.data.defaultInterestRate && savedData.interestRate) ? 'input' : 'input input-default',
        inflationRateInputClass: (savedData.inflationRate !== this.data.defaultInflationRate && savedData.inflationRate) ? 'input' : 'input input-default',
        yearsInputClass: (savedData.years !== this.data.defaultYears && savedData.years) ? 'input' : 'input input-default',
        isTargetMode: savedData.isTargetMode !== undefined ? savedData.isTargetMode : true,
        financeMode: financeMode,
        statusBarHeight: statusBarHeight
      });
    } else {
      this.setData({
        saving: this.data.defaultSaving,
        savingInputClass: 'input input-default',
        financeMode: 'expense',
        statusBarHeight: statusBarHeight
      });
    }
    
    // 计算储蓄率
    this.updateSavingsRate();
  },
  
  onShow: function() {
    // 页面显示时可能需要执行的逻辑
  },
  
  // 计算储蓄率
  updateSavingsRate: function() {
    let income, expense;
    
    if (this.data.financeMode === 'expense') {
      // 支出模式：根据收入和支出计算储蓄率
      income = parseFloat(this.data.income) || 0;
      expense = parseFloat(this.data.expense) || 0;
    } else {
      // 储蓄模式：根据收入和储蓄计算支出，再计算储蓄率
      income = parseFloat(this.data.income) || 0;
      const saving = parseFloat(this.data.saving) || 0;
      expense = income - saving;
    }
    
    if (income > 0) {
      const savingsRate = ((income - expense) / income) * 100;
      // 保留一位小数而不是两位
      this.setData({
        savingsRate: parseFloat(savingsRate.toFixed(1))
      });
    } else {
      this.setData({
        savingsRate: 0
      });
    }
  },
  
  // 财务模式切换（支出模式/储蓄模式）
  onFinanceModeChange: function(e) {
    const selectedMode = e.detail.value;
    
    // 保存当前模式状态到本地存储
    const currentData = wx.getStorageSync('calculatorData') || {};
    currentData.financeMode = selectedMode;
    
    // 切换模式时不进行数据转换，两种模式的数据完全独立
    if (selectedMode === 'saving' && this.data.financeMode === 'expense') {
      // 从支出模式切换到储蓄模式
      this.setData({
        financeMode: selectedMode,
        isTargetMode: false  // 储蓄模式下强制使用预测模式
      });
      
      // 更新本地存储中的模式状态
      currentData.isTargetMode = false;
      wx.setStorageSync('calculatorData', currentData);
    } else if (selectedMode === 'expense' && this.data.financeMode === 'saving') {
      // 从储蓄模式切换到支出模式
      this.setData({
        financeMode: selectedMode,
        isTargetMode: true  // 从储蓄模式切换到支出模式时默认选中目标模式
      });
      
      // 更新本地存储中的模式状态
      currentData.isTargetMode = true;
      wx.setStorageSync('calculatorData', currentData);
    } else {
      this.setData({
        financeMode: selectedMode
      });
    }
    
    wx.setStorageSync('calculatorData', currentData);
    
    // 重新计算储蓄率
    this.updateSavingsRate();
  },
  
  // 模式切换
  onModeChange: function(e) {
    const selectedMode = e.detail.value;
    const isTargetMode = (selectedMode === 'target');
    
    this.setData({
      isTargetMode: isTargetMode
    });
    
    // 保存当前模式状态到本地存储
    const currentData = wx.getStorageSync('calculatorData') || {};
    currentData.isTargetMode = isTargetMode;
    wx.setStorageSync('calculatorData', currentData);
  },
  
  // 储蓄输入
  onSavingInput: function(e) {
    const value = e.detail.value;
    const saving = parseFloat(value) || 0;
    const income = parseFloat(this.data.income) || 0;
    
    // 两种模式下都只更新储蓄值本身，不影响对方的数据
    this.setData({
      saving: value,
      savingInputClass: value === this.data.defaultSaving || !value ? 'input input-default' : 'input'
    });
    
    // 只在储蓄模式下更新储蓄率
    if (this.data.financeMode === 'saving') {
      if (income > 0) {
        const newSavingsRate = Number(((saving / income) * 100).toFixed(1));
        const finalSavingsRate = Math.min(100, Math.max(0, newSavingsRate));
        this.setData({
          savingsRate: finalSavingsRate
        });
      } else {
        this.setData({
          savingsRate: 0
        });
      }
      this.updateSavingsRate();
    }
  },
  
  // 储蓄输入框聚焦
  onSavingFocus: function(e) {
    if (this.data.saving === this.data.defaultSaving) {
      this.setData({
        saving: '',
        savingInputClass: 'input input-default'
      });
    } else {
      this.setData({
        savingInputClass: 'input'
      });
    }
  },
  
  // 储蓄输入框失焦
  onSavingBlur: function(e) {
    if (!e.detail.value) {
      const value = this.data.defaultSaving;
      this.setData({
        saving: value,
        savingInputClass: 'input input-default'
      });
      
      // 只在储蓄模式下更新储蓄率
      if (this.data.financeMode === 'saving') {
        const income = parseFloat(this.data.income) || 0;
        if (income > 0) {
          const newSavingsRate = Number(((parseFloat(value) / income) * 100).toFixed(1));
          const finalSavingsRate = Math.min(100, Math.max(0, newSavingsRate));
          this.setData({
            savingsRate: finalSavingsRate
          });
        } else {
          this.setData({
            savingsRate: 0
          });
        }
        this.updateSavingsRate();
      }
    } else {
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          saving: value.toString()
        });
      }
      
      this.setData({
        savingInputClass: 'input'
      });
      
      // 只在储蓄模式下更新储蓄率
      if (this.data.financeMode === 'saving') {
        const income = parseFloat(this.data.income) || 0;
        if (income > 0) {
          const newSavingsRate = Number(((value / income) * 100).toFixed(1));
          const finalSavingsRate = Math.min(100, Math.max(0, newSavingsRate));
          this.setData({
            savingsRate: finalSavingsRate
          });
        } else {
          this.setData({
            savingsRate: 0
          });
        }
        this.updateSavingsRate();
      }
    }
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
    });
    
    // 根据财务模式更新相应的值
    if (this.data.financeMode === 'expense') {
      // 支出模式：根据当前储蓄率重新计算年支出
      const savingsRate = parseFloat(this.data.savingsRate) || 0;
      const newExpense = parseFloat(value) * (1 - savingsRate / 100);
      this.setData({
        expense: newExpense.toFixed(2).toString()
      });
      this.updateSavingsRate();
    } else {
      // 储蓄模式：只更新储蓄率，不影响支出和储蓄值
      this.updateSavingsRate();
    }
  },
  
  onExpenseInput: function(e) {
    const value = e.detail.value;
    this.setData({
      expense: value,
      expenseInputClass: value === this.data.defaultExpense || !value ? 'input input-default' : 'input'
    });
    
    // 只在支出模式下根据新的支出值计算储蓄率
    if (this.data.financeMode === 'expense') {
      const income = parseFloat(this.data.income) || 0;
      
      // 根据收入和支出重新计算储蓄率，保留一位小数
      if (income > 0) {
        // 储蓄率 = (收入 - 支出) / 收入 * 100
        const calculatedSavingsRate = Number((((income - parseFloat(value)) / income) * 100).toFixed(1));
        const finalSavingsRate = Math.min(100, Math.max(0, calculatedSavingsRate));
        this.setData({
          savingsRate: finalSavingsRate
        });
      } else {
        this.setData({
          savingsRate: 0
        });
      }
      
      this.updateSavingsRate();
    }
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
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          principal: value.toString()
        });
      }
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
      });
      
      // 如果是支出模式，根据默认收入和当前储蓄率重新计算年支出
      if (this.data.financeMode === 'expense') {
        const defaultIncome = parseFloat(this.data.defaultIncome) || 0;
        const savingsRate = parseFloat(this.data.savingsRate) || 0;
        const newExpense = defaultIncome * (1 - savingsRate / 100);
        this.setData({
          expense: newExpense.toFixed(2).toString()
        });
      }
    } else {
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          income: value.toString()
        });
      }
      
      this.setData({
        incomeInputClass: 'input'
      });
      
      // 如果是支出模式，根据当前收入和储蓄率重新计算年支出
      if (this.data.financeMode === 'expense') {
        const income = value;
        const savingsRate = parseFloat(this.data.savingsRate) || 0;
        const newExpense = income * (1 - savingsRate / 100);
        this.setData({
          expense: newExpense.toFixed(2).toString()
        });
      }
    }
  },
  
  onExpenseFocus: function(e) {
    if (this.data.expense === this.data.defaultExpense) {
      this.setData({
        expense: '',
        expenseInputClass: 'input'
      });
    } else {
      this.setData({
        expenseInputClass: 'input'
      });
    }
  },
  
  onExpenseBlur: function(e) {
    if (!e.detail.value) {
      const value = this.data.defaultExpense;
      this.setData({
        expense: value,
        expenseInputClass: 'input input-default'
      });
      
      // 只在支出模式下根据默认支出计算储蓄率
      if (this.data.financeMode === 'expense') {
        const income = parseFloat(this.data.income) || 0;
        
        // 更新储蓄率，保留一位小数
        if (income > 0) {
          const newSavingsRate = Number((((income - parseFloat(value)) / income) * 100).toFixed(1));
          const finalSavingsRate = Math.min(100, Math.max(0, newSavingsRate));
          this.setData({
            savingsRate: finalSavingsRate
          });
        } else {
          this.setData({
            savingsRate: 0
          });
        }
        
        this.updateSavingsRate();
      }
    } else {
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          expense: value.toString()
        });
      }
      
      // 只在支出模式下根据支出计算储蓄率
      if (this.data.financeMode === 'expense') {
        const income = parseFloat(this.data.income) || 0;
        
        // 更新储蓄率，保留一位小数
        if (income > 0) {
          const newSavingsRate = Number((((income - value) / income) * 100).toFixed(1));
          const finalSavingsRate = Math.min(100, Math.max(0, newSavingsRate));
          this.setData({
            savingsRate: finalSavingsRate
          });
        } else {
          this.setData({
            savingsRate: 0
          });
        }
        
        this.updateSavingsRate();
      }
    }
  },
  
  // 储蓄率滑动条变化
  onSavingsRateChange: function(e) {
    let newSavingsRate = e.detail.value;
    
    // 滑动时进行吸附，四舍五入到最近的10的倍数
    const roundedSavingsRate = Math.round(newSavingsRate / 10) * 10;
    // 确保不超过100%并保留一位小数
    newSavingsRate = Number((Math.min(100, Math.max(0, roundedSavingsRate)).toFixed(1)));
    
    const income = parseFloat(this.data.income) || 0;
    
    // 根据当前财务模式计算
    if (this.data.financeMode === 'expense') {
      // 支出模式：根据储蓄率计算年支出
      const newExpense = income * (1 - newSavingsRate / 100);
      this.setData({
        savingsRate: newSavingsRate,
        expense: newExpense.toFixed(2).toString()
      });
    } else {
      // 储蓄模式：根据储蓄率计算年储蓄
      const newSaving = income * (newSavingsRate / 100);
      this.setData({
        savingsRate: newSavingsRate,
        saving: newSaving.toFixed(2).toString()
      });
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
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          interestRate: value.toString()
        });
      }
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
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          inflationRate: value.toString()
        });
      }
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
      let value = parseFloat(e.detail.value) || 0;
      // 如果是负数，转换为其绝对值
      if (value < 0) {
        value = Math.abs(value);
        this.setData({
          years: value.toString()
        });
      }
      this.setData({
        yearsInputClass: 'input'
      })
    }
  },
  
  calculate: function() {
    // 根据财务模式确定支出值和进行校验
    let finalExpense;
    let finalIncome;
    
    if (this.data.financeMode === 'expense') {
      // 支出模式：使用用户输入的收入和支出值
      finalIncome = parseFloat(this.data.income === '' ? this.data.defaultIncome : this.data.income);
      finalExpense = parseFloat(this.data.expense === '' ? this.data.defaultExpense : this.data.expense);
      
      // 收入/支出模式的校验：年收入必须大于等于年支出
      if (finalExpense > finalIncome) {
        wx.showToast({
          title: '年支出不能大于年收入',
          icon: 'none'
        });
        return;
      }
    } else {
      // 储蓄模式：年储蓄是独立值
      // 在储蓄模式下，计算公式是：年末本金 = 年初本金 + 年储蓄 + 利息
      // 为了使用统一的计算公式（年末本金 = 年初本金 + 收入 - 支出 + 利息）
      // 我们将 finalIncome 设为年储蓄，finalExpense 设为 0
      const saving = parseFloat(this.data.saving === '' ? this.data.defaultSaving : this.data.saving);
      
      // 储蓄模式的校验：年储蓄必须大于等于0
      if (saving < 0) {
        wx.showToast({
          title: '年储蓄不能为负数',
          icon: 'none'
        });
        return;
      }
      
      // 储蓄模式下：收入=年储蓄，支出=0
      finalIncome = saving;
      finalExpense = 0;
    }
    
    // 将支出转换为字符串
    finalExpense = finalExpense.toString();
    
    const { principal, income, interestRate, inflationRate, years, 
            defaultPrincipal, defaultIncome, 
            defaultInterestRate, defaultInflationRate, defaultYears, isTargetMode } = this.data;
    
    // 使用默认值填充空字段
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
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      });
      return;
    }
    
    // 验证是否输入了负值
    if (principalNum < 0 || incomeNum < 0 || expenseNum < 0 || 
        interestRateNum < 0 || inflationRateNum < 0) {
      wx.showToast({
        title: '输入值不能为负数',
        icon: 'none'
      });
      return;
    }
    
    let results = [];
    
    if (isTargetMode) {
      // 目标模式：计算需要多少年才能达到财务自由
      results = this.calculateTargetMode(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum);
    } else {
      // 预测模式：计算指定年数后的财务状况
      const yearsNum = parseInt(years === '' || years === defaultYears ? defaultYears : years);
      if (isNaN(yearsNum)) {
        wx.showToast({
          title: '请输入有效数字',
          icon: 'none'
        });
        return;
      }
      results = this.calculatePredictionMode(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum, yearsNum);
    }
    
    // 进行分析
    const analysis = this.analyzeResults(results, expenseNum, incomeNum, interestRateNum, inflationRateNum);
    
    // 准备要保存的数据
    const calculatorData = {
      principal: finalPrincipal,
      income: finalIncome.toString(),
      expense: finalExpense, // 保存计算得出的支出值
      saving: this.data.saving, // 保存储蓄值
      interestRate: finalInterestRate,
      inflationRate: finalInflationRate,
      years: years, // 保持原有年份数据
      isTargetMode: isTargetMode,
      financeMode: this.data.financeMode // 保存当前财务模式
    };
    
    // 在目标模式下更新计算得出的年份
    if (isTargetMode && results.length > 0) {
      const updateData = {
        results: results,
        analysis: analysis,
        calculatedYears: results.length.toString(),
        principal: finalPrincipal,
        interestRate: finalInterestRate,
        inflationRate: finalInflationRate,
        principalInputClass: finalPrincipal !== this.data.defaultPrincipal ? 'input' : 'input input-default',
        interestRateInputClass: finalInterestRate !== this.data.defaultInterestRate ? 'input' : 'input input-default',
        inflationRateInputClass: finalInflationRate !== this.data.defaultInflationRate ? 'input' : 'input input-default'
      };
      
      // 根据模式更新不同的字段
      if (this.data.financeMode === 'expense') {
        // 支出模式：更新income和expense
        updateData.income = finalIncome.toString();
        updateData.expense = finalExpense;
        updateData.incomeInputClass = finalIncome.toString() !== this.data.defaultIncome ? 'input' : 'input input-default';
        updateData.expenseInputClass = finalExpense !== (parseFloat(this.data.defaultIncome) - parseFloat(this.data.defaultSaving)).toString() ? 'input' : 'input input-default';
      } else {
        // 储蓄模式：只更新saving，不更新income
        updateData.saving = this.data.saving;
        updateData.savingInputClass = this.data.saving !== this.data.defaultSaving ? 'input' : 'input input-default';
      }
      
      this.setData(updateData);
    } else {
      // 预测模式
      const finalYears = (years === '' || years === defaultYears) ? defaultYears : years;
      const updateData = {
        results: results,
        analysis: analysis,
        principal: finalPrincipal,
        interestRate: finalInterestRate,
        inflationRate: finalInflationRate,
        years: finalYears,
        principalInputClass: finalPrincipal !== this.data.defaultPrincipal ? 'input' : 'input input-default',
        interestRateInputClass: finalInterestRate !== this.data.defaultInterestRate ? 'input' : 'input input-default',
        inflationRateInputClass: finalInflationRate !== this.data.defaultInflationRate ? 'input' : 'input input-default',
        yearsInputClass: finalYears !== this.data.defaultYears ? 'input' : 'input input-default'
      };
      
      // 根据模式更新不同的字段
      if (this.data.financeMode === 'expense') {
        // 支出模式：更新income和expense
        updateData.income = finalIncome.toString();
        updateData.expense = finalExpense;
        updateData.incomeInputClass = finalIncome.toString() !== this.data.defaultIncome ? 'input' : 'input input-default';
        updateData.expenseInputClass = finalExpense !== (parseFloat(this.data.defaultIncome) - parseFloat(this.data.defaultSaving)).toString() ? 'input' : 'input input-default';
      } else {
        // 储蓄模式：只更新saving，不更新income
        updateData.saving = this.data.saving;
        updateData.savingInputClass = this.data.saving !== this.data.defaultSaving ? 'input' : 'input input-default';
      }
      
      this.setData(updateData);
    }
    
    // 保存用户输入的数据到本地存储
    wx.setStorageSync('calculatorData', calculatorData);
    
    wx.showToast({
      title: '计算完成',
      icon: 'success'
    });
    
    // 计算完成后滚动到占位元素，确保结果部分与顶部保留空间
    this.setData({
      scrollToResult: true
    });
    
    // 延迟执行滚动，确保DOM已更新
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#results-placeholder',
        duration: 300  // 滚动动画持续时间，单位为毫秒
      });
    }, 100);
  },
  
  // 预测模式计算
  calculatePredictionMode: function(principalNum, incomeNum, expenseNum, interestRateNum, inflationRateNum, yearsNum) {
    let currentPrincipal = principalNum;
    let currentExpense = expenseNum;
    let results = [];
    const isSavingMode = this.data.financeMode === 'saving';
    // 储蓄模式下，显示值应该是年储蓄（incomeNum），支出模式下显示值是年支出（expenseNum）
    const displayValue = isSavingMode ? incomeNum : expenseNum;
    
    for (let i = 0; i < yearsNum; i++) {
      // 计算当前年的利息
      const interest = util.multiply(currentPrincipal, interestRateNum);
      
      // 计算年末本金：年初本金 + 收入 - 支出 + 利息
      const newPrincipal = util.add(util.add(util.subtract(currentPrincipal, currentExpense), incomeNum), interest);
      
      // 记录当前年份结果
      results.push({
        year: i + 1,
        expense: util.toFixed2(isSavingMode ? displayValue : currentExpense), // 储蓄模式显示年储蓄，支出模式显示增长后的年支出
        interest: util.toFixed2(interest),
        principal: util.toFixed2(newPrincipal)
      });
      
      // 更新本金用于下一年计算
      currentPrincipal = newPrincipal;
      
      // 更新支出（考虑通胀）- 只在支出模式下更新
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
    let results = [];
    let year = 0;
    // 设置一个最大年数限制，避免无限循环
    const maxYears = 100;
    const isSavingMode = this.data.financeMode === 'saving';
    // 储蓄模式下，显示值应该是年储蓄（incomeNum），支出模式下显示值是年支出（expenseNum）
    const displayValue = isSavingMode ? incomeNum : expenseNum;
    
    while (year < maxYears) {
      // 计算当前年的利息
      const interest = util.multiply(currentPrincipal, interestRateNum);
      
      // 计算年末本金：年初本金 + 收入 - 支出 + 利息
      const newPrincipal = util.add(util.add(util.subtract(currentPrincipal, currentExpense), incomeNum), interest);
      
      // 记录当前年份结果
      results.push({
        year: year + 1,
        expense: util.toFixed2(isSavingMode ? displayValue : currentExpense), // 储蓄模式显示年储蓄，支出模式显示增长后的年支出
        interest: util.toFixed2(interest),
        principal: util.toFixed2(newPrincipal)
      });
      
      // 检查是否达到财务自由（投资收益能覆盖支出）
      if (interest >= currentExpense) {
        // 达到财务自由，停止计算
        break;
      }
      
      // 更新本金用于下一年计算
      currentPrincipal = newPrincipal;
      
      // 更新支出（考虑通胀）- 只在支出模式下更新
      if (!isSavingMode) {
        currentExpense = util.multiply(currentExpense, (1 + inflationRateNum));
      }
      year++;
    }
    
    return results;
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
    
    // 根据财务模式提供不同的分析
    if (this.data.financeMode === 'expense') {
      // 支出模式下的分析
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
      
      // 提供建议
      analysis.push('建议：提高储蓄率、优化投资组合、控制生活成本，有助于更快实现Fire目标。');
    } else {
      // 储蓄模式下的分析
      const lastInterest = finalResult.interest;
      analysis.push(`在最后一年，您的投资收益为${lastInterest}元。`);
      
      // 分析储蓄增长效果
      const totalSavings = results.reduce((sum, result, index) => {
        return sum + parseFloat(result.interest);
      }, 0);
      analysis.push(`${results.length}年间，您的投资总收益为${totalSavings.toFixed(2)}元。`);
      
      // 投资回报率分析
      if (interestRate * 100 > inflationRate * 100) {
        analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)高于通胀率(${(inflationRate * 100).toFixed(2)}%)，资产实际价值在增长。`);
      } else {
        analysis.push(`您的投资回报率(${(interestRate * 100).toFixed(2)}%)低于或等于通胀率(${(inflationRate * 100).toFixed(2)}%)，需要注意资产的保值增值。`);
      }
      
      // 提供建议
      analysis.push('建议：保持稳定的储蓄习惯、优化投资组合，有助于资产持续增长。');
    }
    
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
    const currentTargetMode = this.data.isTargetMode; // 保存当前目标模式
    const currentFinanceMode = this.data.financeMode; // 保存当前财务模式
    
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入并恢复默认值吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地存储
          wx.removeStorageSync('calculatorData');
          
          // 恢复默认值和样式，但保留当前模式
          this.setData({
            principal: this.data.defaultPrincipal,
            income: this.data.defaultIncome,
            expense: this.data.defaultExpense,
            saving: this.data.defaultSaving,
            interestRate: this.data.defaultInterestRate,
            inflationRate: this.data.defaultInflationRate,
            years: this.data.defaultYears,
            principalInputClass: 'input input-default',
            incomeInputClass: 'input input-default',
            expenseInputClass: 'input input-default',
            savingInputClass: 'input input-default',
            interestRateInputClass: 'input input-default',
            inflationRateInputClass: 'input input-default',
            yearsInputClass: 'input input-default',
            results: [],
            analysis: [],
            calculatedYears: '',
            savingsRate: '40.00',
            isTargetMode: currentTargetMode, // 保持当前目标模式
            financeMode: currentFinanceMode // 保持当前财务模式
          });
          
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
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