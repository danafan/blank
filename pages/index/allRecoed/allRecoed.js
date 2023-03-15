Page({
  data: {
    recordList: [],                        //记录列表
    isLoad: true,                          //默认可以加载下一页
    page: 1,                               //当前页码
    search: "",                            //输入的搜索内容
  },
  onLoad(e) {
    //获取我的所有记录
    this.getRecord();
  },
  //监听输入的搜索内容
  bindKeyInput(value) {
    this.setData({
      search:value.detail.value
    });
  },
  //点击搜索按钮
  search() {
    if(this.data.search == ""){
      this.setData({
        searchId:""
      })
    }
    //获取我的所有记录
    this.setData({
      page: 1,
      recordList:[],
      isLoad: true
    })
    this.getRecord();
  },
  //获取我的所有记录
  getRecord() {
    dd.showLoading({
      content: '正在加载...'
    });
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'package/packageList',
      method: 'GET',
      data: {
        page: this.data.page,
        search: this.data.search
      },
      dataType: 'json',
      success: (res) => {
        dd.hideLoading();
        var data = res.data;
        if (data.code == 1) {
          let list = data.data.data;
          this.setData({
            recordList: this.data.recordList.concat(Array.from(list))
          });
          if (data.last_page == this.data.page) {
            this.setData({
              isLoad: false
            })
          }else{
            this.setData({
              isLoad: true
            })
          }
        } else {
          dd.showToast({
            type: 'none',
            content: data.msg,
            duration: 2000
          });
        }
      },
      fail: (res) => {
        dd.hideLoading();
        dd.alert({ content: res });
      },
    });
  },
  //页面滚动到底部触发（加载下一页）
  lower(e) {
    if (this.data.isLoad == true) {
      this.setData({
        page: this.data.page + 1
      });
      //获取我的所有记录
      this.getRecord(this.data.url);
    }
  },
  //点击查看详情
  detail(e) {
    let id = e.currentTarget.dataset.id;
    dd.navigateTo({ url: '/pages/index/record/detail/detail?type=2&id=' + id });
  }
})