Page({
  data: {
    recordList: [],                       //记录列表
    isLoad: true,                         //默认可以加载下一页
    page: 1,                              //当前页码
    isFocus: false,                       //默认供应商下拉框不展示
    searchList: [],                       //展示的供应商列表（包括模糊查询）
    supplier: "",                         //供应商展示的内容
    id: "",                               //选中的供应商id
  },
  onLoad() {
    //获取我的所有记录
    this.getRecord();
  },
  //选择供应商输入框获取焦点事件（下拉框展示）
  onfocus() {
    //下拉框展示
    this.setData({
      isFocus: true
    });
  },
  //下拉框隐藏
  supOnblur() {
    this.setData({
      isFocus: false
    });
  },
  //监听供应商输入
  bindKeyInput(e) {
    this.setData({
      supplier: e.detail.value
    });
    dd.httpRequest({
        url: getApp().globalData.baseurl + 'package/ajaxsupplier',
        method: 'GET',
        data: {
          name: e.detail.value
        },
        dataType: 'json',
        success: (res) => {
          var data = res.data;
          if (data.code == 1) {
            this.setData({
              searchList: data.data
            });
          } else {
            dd.showToast({
              type: 'none',
              content: data.msg,
              duration: 2000
            });
          }
        }
      });
  },
  //点击选中某一个供应商
  selItem(e) {
    this.setData({
      supplier: e.target.dataset.item.supplier_name,
      id: e.target.dataset.item.supplier_id,
      isFocus: false
    });
  },
  // 点击搜索
  searchFun(){
    this.setData({
      page:1,
      id:this.data.supplier == ""?"":this.data.id,
      recordList:[]
    })
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
        supplier_id:this.data.id
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
