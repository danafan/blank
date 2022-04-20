Page({
  data: {
    toast: true,           //默认进入页面弹框展示
    isfocus: false,        //默认唯一码获取焦点
    isModel: false,        //是否显示修改修改数量弹窗
    isBall: false,         //默认确认包裹信息弹框不显示
    dataObj: {},           //添加商品返回的供应商信息
    goodsList: [],         //添加商品返回的商品列表
    code: "",              //唯一码
    package: "",           //包裹id
    packageObj: {},        //包裹信息
    isFocus: false,        //默认供应商下拉框不展示
    searchList: [],        //展示的供应商列表（包括模糊查询）
    supplier: "",          //供应商展示的内容
    id: "",                //选中的供应商id
    isOver: true,          //为true时可点击完成打包
    goodsItemCode: "",      //扫描之后临时的商品code
    goodsItemNum: 1,      //扫描之后临时的商品数量
  },
  //点击提示的我知道了
  ikonw() {
    this.setData({
      toast: false,
      isfocus: true
    });
  },
  //监听修改商品数量
  bindGoodsNumber(e) {
    this.setData({
      goodsItemNum: e.detail.value
    })
  },
  //确定数量
  confirmNum() {
    if (this.data.goodsItemNum == '' || this.data.goodsItemNum < 1) {
      dd.showToast({
        type: 'none',
        content: "数量至少1件！",
        duration: 2000
      });
    } else {
      let goodsItem = {
        sku_id: this.data.code,
        num: this.data.goodsItemNum
      }
      this.setData({
        goodsList: [...this.data.goodsList, ...[goodsItem]],
        goodsItemCode: "",
        goodsItemNum: 1,
        isModel: false,
        isfocus: true
      })
    }
  },
  //删除商品
  deleteGoods(v) {
    let index = v.target.dataset.index;
    let dd = this.data.goodsList;
    dd.splice(index, 1);
    this.setData({
      goodsList: dd
    })
  },
  //监听唯一码输入框输入
  bindKeyInput1(e) {
    this.setData({
      goodsItemCode: e.detail.value
    });
  },
  //回车时触发
  searchBtn() {
    if (this.data.goodsItemCode == "") {
      dd.showToast({
        type: 'none',
        content: "请扫描商品编码",
        duration: 2000
      });
      return;
    } else {
      dd.httpRequest({
        url: getApp().globalData.baseurl + 'package/check_sku',
        method: 'POST',
        data: {
          sku_id: this.data.goodsItemCode
        },
        dataType: 'json',
        success: (res) => {
          this.setData({
            code:this.data.goodsItemCode,
            goodsItemCode: ""
          })
          var data = res.data;
          if (data.code == 1) {
            var isHas = false;
            this.data.goodsList.map(item => {
              if (item.sku_id == this.data.goodsItemCode) {
                isHas = true;
              }
            });
            if (isHas == true) {
              dd.vibrateLong({
                success: () => {
                  dd.showToast({
                    type: 'none',
                    content: "该商品已存在，请删除后重新录入！",
                    duration: 2000
                  });
                }
              });
            } else {
              dd.vibrateShort({
                success: () => {
                  this.setData({
                    isModel: true
                  })
                }
              });
            }
          } else {
            dd.vibrateLong({
              success: () => {
                dd.alert({
                  title: '提示',
                  content: data.msg,
                  buttonText: '我知道了'
                });
              }
            });
          }
        },
        complete: (res) => {
          this.setData({
            goodsItemCode: ""
          })
        }
      });

    }

  },
  //保证唯一码input一直输入状态
  onblur() {
    this.setData({
      isfocus: false
    });
    if (this.data.isBall == false && this.data.isModel == false) {
      this.setData({
        isfocus: true
      });
    }
  },
  //打开完成打包弹框
  showBall() {
    if (this.data.goodsList.length == 0) {
      dd.showToast({
        type: 'none',
        content: "还没有商品哦～",
        duration: 2000
      });
    } else {
      this.setData({
        isBall: true
      });
    }
  },
  //关闭完成打包弹框
  closeBall() {
    this.setData({
      isBall: false,
      isfocus: true
    })
  },
  //选择供应商输入框获取焦点事件（下拉框展示）
  supOnfocus() {
    //下拉框展示
    this.setData({
      isFocus: true
    });
  },
  //监听供应商输入
  bindKeyInput(e) {
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
  //下拉框隐藏
  supOnblur() {
    this.setData({
      isFocus: false
    });
  },
  //确认打包
  ok() {
    if (getApp().globalData.printer == "") {
      dd.showToast({
        type: 'none',
        content: '请选择打印机',
        duration: 2000,
        success: () => {
          dd.navigateTo({ url: '/pages/index/printer/printer' });
        }
      });
    } else if (this.data.supplier == "") {
      dd.showToast({
        type: 'none',
        content: '请选择供应商',
        duration: 2000
      });
    } else {
      dd.showLoading({
        content: '正在打包...'
      });
      dd.httpRequest({
        url: getApp().globalData.baseurl + 'package/batch_pack',
        method: 'POST',
        data: {
          data: JSON.stringify(this.data.goodsList),
          supplier_id: this.data.id,
          printer: getApp().globalData.printer,
        },
        dataType: 'json',
        success: (res) => {
          dd.hideLoading();
          var data = res.data;
          if (data.code == 1) {
            this.setData({
              isBall: false
            })
            dd.showToast({
              type: 'none',
              content: '打包完成',
              duration: 1000,
              success: () => {
                dd.navigateBack({
                  delta: 1
                })
              }
            });
          } else if (data.code == 100) {
            dd.showToast({
              type: 'none',
              content: '当前打印机已掉线，请重新选择',
              duration: 2000,
              success: () => {
                dd.navigateTo({ url: '/pages/index/printer/printer' });
              }
            });
          } else if (data.code == 0) {
            dd.confirm({
              title: '提示',
              content: data.msg,
              confirmButtonText: '继续',
              cancelButtonText: '取消',
              success: (result) => {
                if (result.confirm == true) {
                  this.setData({
                    type: 0
                  })
                  this.ok();
                } else {
                  dd.showToast({
                    type: 'none',
                    content: "取消打包",
                    duration: 2000
                  });
                };
              },
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

});
