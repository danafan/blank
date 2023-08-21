Page({
  data: {
    sku: "",            //唯一码
    type:0,            //是否是唯一码
    objectArray: [],    //仓库列表
    arrIndex: 0,        //默认选中的仓库下标
    num:1,
    cause: "",          //退货原因
    title: "",           //顶部标题
  },
  onLoad(e) {
    this.setData({
      sku:getApp().globalData.codeObj
    })
    //验证商品唯一码
    this.verify();
    //获取仓库列表
    this.getStash();
  },
  bindKeyInput(e){
    this.setData({
      num:e.detail.value
    })
  },
  //获取仓库列表
  getStash(){
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'goods/return_wms',
      method: 'GET',
      data: {},
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          let default_index = data.data.findIndex(item => {
            return item.is_default == 1;
          })
          this.setData({
            objectArray:data.data,
            arrIndex:default_index
          })
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
  //验证商品唯一码
  verify() {
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'goods/check_code',
      method: 'GET',
      data: {
        unique_no: getApp().globalData.codeObj
      },
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          this.setData({
            sku: getApp().globalData.codeObj,
            type:data.data.type
          })
        } else {
          dd.showToast({
            type: 'none',
            content: data.msg,
            duration: 2000,
            success: () => {
              dd.navigateBack({
                delta: 1
              })
            }
          });
        }
      }
    });
  },
  //监听输入的退错原因
  inputKey(e) {
    this.setData({
      cause: e.detail.value
    });
  },
  //切换仓库
  bindObjPickerChange(e) {
    this.setData({
      arrIndex: e.detail.value,
    });
  },
  //点击提交
  submit() {
    if(this.data.num == ''){
      dd.showToast({
        type: 'none',
        content: '数量不能为空',
        duration: 2000
      });
    }else if (this.data.num <= 0) {
      dd.showToast({
        type: 'none',
        content: '数量必须大于0',
        duration: 2000
      });
    }else if (this.data.cause == "") {
      dd.showToast({
        type: 'none',
        content: '请输入退错原因',
        duration: 2000
      });
    } else {
      dd.showLoading({
        content: '正在提交...'
      });
      dd.httpRequest({
        url: getApp().globalData.baseurl + 'goods/commit_return_reason',
        method: 'POST',
        data: {
          unique_no: this.data.sku,
          reason: this.data.cause,
          num:this.data.num,
          wms_co_id:this.data.objectArray[this.data.arrIndex].wms_co_id
        },
        dataType: 'json',
        success: (res) => {
          dd.hideLoading();
          var data = res.data;
          if (data.code == 1) {
            dd.showToast({
              type: 'none',
              content: "退回成功",
              duration: 1000,
              success: () => {
                dd.navigateBack({
                  delta: 1
                })
              }
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
    }
  }
})