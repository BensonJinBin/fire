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
    // 模拟数据
    const mockData = [
      {
        id: '161226',
        name: '国投白银LOF',
        code: '161226',
        status: 'pause',
        limitAmount: null,
        currentPrice: 4.722,
        t1Value: 1.8481,
        t1PremiumRate: 155.51
      },
      {
        id: '162719',
        name: '石油LOF',
        code: '162719',
        status: 'limit',
        limitAmount: 10,
        currentPrice: 2.54,
        t1Value: 2.3254,
        t1PremiumRate: 9.23
      },
      {
        id: '160416',
        name: '石油基金LOF',
        code: '160416',
        status: 'pause',
        limitAmount: null,
        currentPrice: 2.021,
        t1Value: 1.8551,
        t1PremiumRate: 8.94
      },
      {
        id: '501225',
        name: '全球芯片LOF',
        code: '501225',
        status: 'pause',
        limitAmount: null,
        currentPrice: 2.426,
        t1Value: 2.2396,
        t1PremiumRate: 8.32
      },
      {
        id: '161129',
        name: '原油LOF易方达',
        code: '161129',
        status: 'pause',
        limitAmount: null,
        currentPrice: 1.215,
        t1Value: 1.1336,
        t1PremiumRate: 7.18
      },
      {
        id: '501018',
        name: '南方原油LOF',
        code: '501018',
        status: 'limit',
        limitAmount: 10,
        currentPrice: 1.257,
        t1Value: 1.1761,
        t1PremiumRate: 6.88
      },
      {
        id: '161116',
        name: '黄金主题LOF',
        code: '161116',
        status: 'pause',
        limitAmount: null,
        currentPrice: 1.87,
        t1Value: 1.7727,
        t1PremiumRate: 5.49
      },
      {
        id: '164701',
        name: '黄金LOF',
        code: '164701',
        status: 'limit',
        limitAmount: 10,
        currentPrice: 1.987,
        t1Value: 1.8871,
        t1PremiumRate: 5.29
      },
      {
        id: '160644',
        name: '港美互联网LOF',
        code: '160644',
        status: 'limit',
        limitAmount: 100000,
        currentPrice: 1.73,
        t1Value: 1.6808,
        t1PremiumRate: 2.93
      }
    ];

    // 为每个基金添加statusText字段
    let processedData = mockData.map(item => ({
      ...item,
      statusText: this.getStatusText(item.status, item.limitAmount)
    }));

    // 按照默认排序顺序进行排序
    const { sortOrder } = this.data;
    processedData = processedData.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.t1PremiumRate - b.t1PremiumRate;
      } else {
        return b.t1PremiumRate - a.t1PremiumRate;
      }
    });

    this.setData({
      allLofList: processedData,
      lofList: this.filterData(processedData),
      updateTime: this.getCurrentTime()
    });
  },

  // 根据当前Tab筛选数据
  filterData: function(data) {
    const { currentTab } = this.data;
    if (currentTab === 0) {
      // 套利机会：状态不是暂停，且溢价率大于0
      return data.filter(item => item.status !== 'pause' && item.t1PremiumRate > 0);
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

  getStatusText: function(status, limitAmount) {
    if (status === 'pause') return '暂停';
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
      if (newOrder === 'asc') {
        return a.t1PremiumRate - b.t1PremiumRate;
      } else {
        return b.t1PremiumRate - a.t1PremiumRate;
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