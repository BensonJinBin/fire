// app.js
App({
  onLaunch: function () {
    // 使用跨账号云开发初始化
    if (wx.cloud) {
      // 创建跨账号云开发实例
      const cloud = new wx.cloud.Cloud({
        resourceAppid: 'wx4c4b54bc609bd79e',
        resourceEnv: 'toastmasters-9gbogzjz89b0e835'
      })
      
      // 初始化云开发
      cloud.init()
        .then(() => {
          console.log('跨账号云开发初始化成功');
          // 将实例保存到全局
          getApp().cloud = cloud;
        })
        .catch(err => {
          console.error('跨账号云开发初始化失败:', err);
        })
    } else {
      console.error('云开发API不可用');
    }
  },
  globalData: {
    userInfo: null
  }
})