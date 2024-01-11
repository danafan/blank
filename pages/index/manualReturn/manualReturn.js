Page({
  data: {
    sku: "", //唯一码
  },
  bindKeyInput(e) {
    this.setData({
      sku: e.detail.value
    })
  },
  //点击提交
  submit() {
    if (this.data.sku == '') {
      dd.showToast({
        type: 'none',
        content: '商品唯一码不能为空',
        duration: 2000
      });
    } else if (this.data.sku.indexOf("type") > -1) {
      dd.showToast({
        type: 'none',
        content: '请输入正确的商品唯一码',
        duration: 2000
      });
    } else {
      getApp().globalData.codeObj = this.data.sku;
      dd.navigateTo({
        url: '/pages/index/sendback/sendback'
      });
    }
  }
})