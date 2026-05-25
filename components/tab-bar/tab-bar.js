// components/tab-bar/tab-bar.js
Component({
  properties: {
    active: {
      type: String,
      value: 'home'
    }
  },

  methods: {
    onTap(e) {
      const page = e.currentTarget.dataset.page;
      if (page === this.data.active) return;

      const urlMap = {
        home: '/pages/index/index',
        calculator: '/pages/calculator/calculator',
        profile: '/pages/profile/profile'
      };

      wx.reLaunch({
        url: urlMap[page],
        fail(err) {
          console.error('tab-bar navigation failed:', err);
        }
      });
    }
  }
});
