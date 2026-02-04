// pages/arbitrage/arbitrage.js
Page({
  data: {
    statusBarHeight: 0,
    updateTime: '',
    currentTab: 0,
    lofList: [],
    allLofList: [], // 保存全部数据
    refreshing: false,
    sortOrder: 'desc' // desc: 降序, asc: 升序
  },

  onLoad: function() {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    
    this.setData({
      statusBarHeight: statusBarHeight,
      updateTime: this.getCurrentTime()
    });

    this.loadLOFData();
  },

  getCurrentTime: function() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${month}月${day}日 ${hours}点${minutes < 10 ? '0' + minutes : minutes}分`;
  },

  loadLOFData: function() {
    wx.showLoading({
      title: '加载中...'
    });

    // 获取全局云开发实例
    const cloud = getApp().cloud;
    if (!cloud) {
      wx.hideLoading();
      wx.showToast({
        title: '云开发未初始化',
        icon: 'none'
      });
      console.error('跨账号云开发实例未初始化');
      return;
    }

    // 使用跨账号云开发实例
    const db = cloud.database();

    console.log('开始查询数据库，使用跨账号云开发实例');

    db.collection('funds')
      .where({
        is_listed: true
      })
      .get()
      .then(res => {
        console.log('数据库查询成功，返回数据:', res.data.length, '条');
        const cloudData = res.data || [];

        // 映射字段格式，并确保溢价率保持两位小数（字符串格式）
        let processedData = cloudData.map(item => {
          // 根据申购状态设置状态和状态文字
          let status = 'normal';
          let statusText = '正常';
          let limitAmount = null;

          if (item.subscription_status === '暂停') {
            status = 'pause';
            statusText = '暂停申购';
          }

          return {
            id: item._id,
            code: item._id,
            name: item.name,
            currentPrice: item.price,
            t1Value: item.nav,
            t1PremiumRate: item.premium_rate.toFixed(2), // 保留两位小数，返回字符串
            status: status,
            limitAmount: limitAmount,
            statusText: statusText,
            premiumRateColor: parseFloat(item.premium_rate) < 0 ? 'green' : 'red' // 负数为绿色，正数为红色
          };
        });

        // 按照默认排序顺序进行排序（需要转换为数值进行排序）
        const { sortOrder } = this.data;
        processedData = processedData.sort((a, b) => {
          const aRate = parseFloat(a.t1PremiumRate);
          const bRate = parseFloat(b.t1PremiumRate);
          if (sortOrder === 'asc') {
            return aRate - bRate;
          } else {
            return bRate - aRate;
          }
        });

        this.setData({
          allLofList: processedData,
          lofList: this.filterData(processedData),
          updateTime: this.getCurrentTime()
        });

        wx.hideLoading();
        console.log('数据加载完成，共', processedData.length, '只基金');
      })
      .catch(err => {
        console.error('获取数据失败:', err);
        console.error('错误详情:', JSON.stringify(err));
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 3000
        });
      });
  },

  // 根据当前Tab筛选数据
  filterData: function(data) {
    const { currentTab } = this.data;
    if (currentTab === 0) {
      // 套利机会：状态不是暂停，且溢价率大于0
      return data.filter(item => item.status !== 'pause' && parseFloat(item.t1PremiumRate) > 0);
    } else {
      // 实时数据：显示全部
      return data;
    }
  },

  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      this.loadLOFData();
      this.setData({ refreshing: false });
    }, 1000);
  },

  switchTab: function(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ currentTab: tab });
    
    // 重新筛选数据
    this.setData({
      lofList: this.filterData(this.data.allLofList)
    });
  },

  onFundClick: function(e) {
    const fund = e.currentTarget.dataset.fund;
    console.log('点击基金:', fund);
    // 可以在这里添加跳转到详情页的逻辑
  },

  onStrategyClick: function() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=https://mp.weixin.qq.com/s/yBxwfxQ5L_ydpBDf1VHAFg'
    });
  },

  getStatusText: function(status, limitAmount) {
    if (status === 'pause') return '暂停申购';
    if (status === 'limit') {
      if (limitAmount >= 100000) return '限10万';
      return `限${limitAmount}`;
    }
    return '正常';
  },

  toggleSort: function() {
    const { allLofList, sortOrder } = this.data;
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    
    const sortedList = [...allLofList].sort((a, b) => {
      const aRate = parseFloat(a.t1PremiumRate);
      const bRate = parseFloat(b.t1PremiumRate);
      if (newOrder === 'asc') {
        return aRate - bRate;
      } else {
        return bRate - aRate;
      }
    });

    this.setData({
      allLofList: sortedList,
      lofList: this.filterData(sortedList),
      sortOrder: newOrder
    });
  },

  onShareAppMessage: function() {
    return {
      title: 'LOF基金套利机会',
      path: '/pages/arbitrage/arbitrage'
    };
  },

  onShareTimeline: function() {
    return {
      title: 'LOF基金套利机会 - 发现溢价套利机会',
      query: '',
      imageUrl: '/images/share/share.jpg'
    };
  }
});