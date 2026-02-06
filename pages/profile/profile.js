// pages/profile/profile.js
Page({
  data: {
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
  
  navigateToIndex: function() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  
  navigateToCalculator: function() {
    wx.redirectTo({
      url: '/pages/calculator/calculator'
    });
  },

  navigateToArbitrage: function() {
    wx.navigateTo({
      url: '/pages/arbitrage/arbitrage'
    })
  },
  
  onShareAppMessage: function() {
    return {
      title: 'FIRE Calculator - 财务自由计算器',
      path: '/pages/profile/profile'
    };
  },

  onShareTimeline: function() {
    return {
      title: 'FIRE Calculator - 财务自由计算器',
      query: ''
    };
  }
})