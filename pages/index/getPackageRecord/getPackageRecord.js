Page({
  data: {
    recordList: [],                        //记录列表
    isLoad: true,                         //默认可以加载下一页
    page: 1,                               //当前页码
  },
  onLoad() {
    //获取我的所有记录
    this.getRecord();
  },
  //获取我的所有记录
  getRecord() {
    dd.showLoading({
      content: '正在加载...'
    });
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'takegoods/list',
      method: 'GET',
      data: {
        page: this.data.page,
      },
      dataType: 'json',
      success: (res) => {
        dd.hideLoading();
        var data = res.data;
        if (data.code == 1) {
          let list = data.data;
          this.setData({
            recordList: this.data.recordList.concat(Array.from(list.data))
          });
          if (list.last_page == this.data.page) {
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
      this.getRecord();
    }
  },
  //取消
  cancel(e){
    let id = e.target.dataset.id;
    let index = e.target.dataset.index;
    dd.confirm({
      title: '提示',
      content: '确认删除？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm == true) {
          dd.httpRequest({
      url: getApp().globalData.baseurl + 'takegoods/del',
      method: 'POST',
      data: {
        id: id,
      },
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          dd.showToast({
            type: 'none',
            content: data.msg,
            duration: 2000
          });
          let arr = this.data.recordList;
          arr.splice(index, 1)
          this.setData({
            recordList: arr
          });
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
        } else {
          dd.showToast({
            type: 'none',
            content: "取消",
            duration: 2000
          });
        }
      },
    });
  }
});
