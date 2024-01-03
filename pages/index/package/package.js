Page({
  data: {
    toast: true,           //默认进入页面弹框展示
    selectSupplier:false,   //选择供应商
    isfocus: false,        //默认唯一码获取焦点
    isBall: false,         //默认确认包裹信息弹框不显示
    dataObj: {},           //添加商品返回的供应商信息
    goodsList: [],         //添加商品返回的商品列表
    code: "",              //唯一码
    package: "",           //包裹id
    packageObj: {},        //包裹信息
    isFocus: false,        //默认供应商下拉框不展示
    searchList: [],        //展示的供应商列表（包括模糊查询）
    supplier: "",          //供应商展示的内容
    remark: "",            //备注
    id: "",                //选中的供应商id
    is_verify:1,           //是否验证
    is_check_return:1,     //是否验证可退
    type: 1,               //1:第一次打包；0:商家不一致确认之后第二次打包
    wms_list: [],          //仓库列表
    wms_index: 0,
    isOver: true,          //为true时可点击完成打包
  },
  onLoad() {
    //判断首页是否意外退出
    this.auto();
    //获取所有仓库列表
    this.getWmsList();
  },
  //点击提示的我知道了
  ikonw() {
    this.setData({
      toast: false,
      isfocus: true
    });
  },
  //判断是否有未完成的包裹
  auto() {
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'package/unfinishedpackage',
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 0) {
          this.setData({
            // dataObj: data.data,
            package: data.data.package_id,
            goodsList: data.goods
          });
          if(data.data.gys){
            this.setData({
              supplier: data.data.gys.supplier_name,
              id: data.data.gys.supplier_id
            });
          }else{
            this.setData({
              selectSupplier:true
            });
          }
        } else {
          this.setData({
            selectSupplier:true,
            // dataObj: {},
            package: "",
            goodsList: []
          });
        }
      }
    });
  },
  //获取所有仓库列表
  getWmsList() {
    dd.httpRequest({
      url: getApp().globalData.baseurl.split('/api/')[0] + '/ajax_wms',
      method: 'GET',
      data: {},
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
         this.setData({
           wms_list:data.data,
           wms_index:data.data.findIndex(item => {return item.is_default == 1})
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
  //监听唯一码输入框输入
  bindKeyInput1(e) {
    this.setData({
      code: e.detail.value
    });
  },
  //监听备注
  checkRemark(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  //回车时触发
  searchBtn() {
    if (this.data.code == "") {
      dd.showToast({
        type: 'none',
        content: "请扫描商品唯一码",
        duration: 2000
      });
      return;
    }
    this.setData({
      isOver: false
    })            //完成打包按钮不可点击
    var obj = {
      uniqNum: this.data.code,
      supplier_id:this.data.id,
      is_verify:this.data.is_verify,
      is_check_return:this.data.is_check_return,
      type: 1
    }
    if (this.data.package != "") {
      obj.package_id = this.data.package
    }
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'package/pack',
      method: 'GET',
      data: obj,
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        this.setData({
          isOver: true,
          code: ""
        });
        if (data.code == 1) {
          this.setData({
            // dataObj: data.data,
            package: data.data.package_id,
            goodsList: data.goods
          });
          dd.vibrateShort({
            success: () => {
              dd.showToast({
                type: 'none',
                content: "添加成功",
                duration: 1000
              });
            }
          });
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
      }, fail: (res) => {
        this.setData({
          code: ""
        });
        dd.alert({
          title: '提示',
          content: res,
          buttonText: '我知道了'
        });
      }
    });
  },
  //保证唯一码input一直输入状态
  onblur() {
    this.setData({
      isfocus: false
    });
    if (this.data.isBall == false) {
      this.setData({
        isfocus: true
      });
    }
  },
  //打开完成打包弹框
  showBall() {
    if (!this.data.isOver) {
      dd.showToast({
        type: 'none',
        content: '正在添加商品，请稍后...',
        duration: 2000,
      });
    } else if (this.data.goodsList.length == 0) {
      dd.showToast({
        type: 'none',
        content: "还没有包裹哦～",
        duration: 2000
      });
    } else {
      dd.httpRequest({
        url: getApp().globalData.baseurl + 'package/packageinfo',
        method: 'GET',
        data: {
          packageId: this.data.package
        },
        dataType: 'json',
        success: (res) => {
          var data = res.data;
          if (data.code == 1) {
            this.setData({
              isBall: true,
              isfocus: false,
              packageObj: data.data
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
  //监听仓库
  bindObjPickerChange(e) {
    this.setData({
      wms_index: e.detail.value
    })
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
  //点击确认选择当前供应商
  checkSupplier(){
    if (this.data.supplier == "") {
      dd.showToast({
        type: 'none',
        content: '请选择供应商',
        duration: 2000
      });
    }else{
      this.setData({
        selectSupplier: false
      })
    }
  },
  //修改是否验证
  radioChange(e){
    this.setData({
      is_verify:e.detail.value
    })
  },
  //修改是否验证可退
  changeReturn(e){
    this.setData({
      is_check_return:e.detail.value
    })
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
        url: getApp().globalData.baseurl + 'package/confirmPackage',
        method: 'GET',
        data: {
          packageId: this.data.package,
          supplier_id: this.data.id,
          time: this.data.packageObj.time,
          operator: this.data.packageObj.operator,
          choose: getApp().globalData.printer,
          remark: this.data.remark,
          wms_id: this.data.wms_list[this.data.wms_index].wms_co_id,
          type: this.data.type
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
  },
  //点击重置
  reset() {
    if (this.data.goodsList.length > 0) {
      dd.confirm({
        title: '提示',
        content: '确定重置并删除包裹内所有商品吗？',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: (result) => {
          if (result.confirm == true) {
            dd.httpRequest({
              url: getApp().globalData.baseurl + 'package/reset',
              method: 'GET',
              data: {
                package_id: this.data.package
              },
              dataType: 'json',
              success: (res) => {
                var data = res.data;
                if (data.code == 1) {
                  dd.showToast({
                    type: 'none',
                    content: "已重置",
                    duration: 2000
                  });
                  this.setData({
                    selectSupplier:true,
                    supplier: '',
                    is_verify:1,
                    id: '',
                  })
                  //刷新列表
                  this.auto();
                } else {
                  dd.showToast({
                    type: 'none',
                    content: data.msg,
                    duration: 2000
                  });
                }
              }
            });
          } else {
            dd.showToast({
              type: 'none',
              content: "取消重置",
              duration: 2000
            });
          }
        },
      });
    } else {
      dd.showToast({
        type: 'none',
        content: "还没有包裹哦~",
        duration: 2000
      });
    }

  }

});
