// pages/index/index.js
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
  
  startCalculator: function() {
    wx.switchTab({
      url: '/pages/calculator/calculator'
    })
  },
  
  goToAbout: function() {
    wx.switchTab({
      url: '/pages/about/about'
    })
  }
})