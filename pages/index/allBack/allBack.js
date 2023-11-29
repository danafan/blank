Page({
  data: {
    selectSupplier: true, //选择供应商弹窗
    isFocus: false, //默认供应商下拉框不展示
    searchList: [], //展示的供应商列表（包括模糊查询）
    supplier: "", //供应商展示的内容
    id: "", //选中的供应商id
    is_verify: 1, //供应商是否验证
    goodsList: [], //商品列表
    remark: "", //退回原因
    wms_list: [], //仓库列表
    wms_index: 0,
    initNum: false, //填写商品数量
    unique_no: "", //唯一码
    num: 1, //商品数量
    isBall: false, //确认退货弹框
  },
  onLoad() {
    //获取所有仓库列表
    this.getWmsList();
    this.setData({
      goodsList:[]
    })
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
            wms_list: data.data,
            wms_index: data.data.findIndex(item => {
              return item.is_default == 1
            })
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
  //选择供应商输入框获取焦点事件（下拉框展示）
  supOnfocus() {
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
  //修改是否验证
  radioChange(e) {
    this.setData({
      is_verify: e.detail.value
    })
  },
  //点击确认选择当前供应商
  checkSupplier() {
    if (this.data.supplier == "") {
      dd.showToast({
        type: 'none',
        content: '请选择供应商',
        duration: 2000
      });
    } else {
      this.setData({
        selectSupplier: false
      })
    }
  },
  //点击扫一扫
  scan() {
    dd.scan({
      type: 'qr',
      success: (scan_res) => {
        if (scan_res.code.indexOf("type") > -1) {
          dd.showToast({
            type: 'none',
            content: "请扫描商品二维码",
            duration: 2000
          });
        } else {
          dd.httpRequest({
            url: getApp().globalData.baseurl + 'goods/check_code',
            method: 'GET',
            data: {
              unique_no: scan_res.code,
              check_type:this.data.is_verify,
              supplier_id:this.data.id
            },
            dataType: 'json',
            success: (res) => {
              var data = res.data;
              if (data.code == 1) {
                let goods_obj = {
                  unique_no: scan_res.code,
                  num: 1
                }
                let goods_list = this.data.goodsList;
                goods_list.push(goods_obj);
                this.setData({
                  // num: 1,
                  // initNum: false,
                  goodsList: goods_list
                });
                this.scan();
                // this.setData({
                //   unique_no:scan_res.code,
                //   initNum:true
                // })
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
  },
  //监听输入的数量
  // checkNum(e) {
  //   this.setData({
  //     num: e.detail.value
  //   })
  // },
  //填写数量确认
  // addGoods() {
  //   if (this.data.num == '' || this.data.num < 0) {
  //     dd.showToast({
  //       type: 'none',
  //       content: "请填写正确的商品数量~",
  //       duration: 2000
  //     });
  //     return;
  //   }
  //   let goods_obj = {
  //     unique_no: this.data.unique_no,
  //     num: this.data.num
  //   }
  //   let goods_list = this.data.goodsList;
  //   goods_list.push(goods_obj);
  //   this.setData({
  //     num: 1,
  //     initNum: false,
  //     goodsList: goods_list
  //   });
  // },
  //填写数量继续扫
  // numScan() {
  //   if (this.data.num == '' || this.data.num < 0) {
  //     dd.showToast({
  //       type: 'none',
  //       content: "请填写正确的商品数量~",
  //       duration: 2000
  //     });
  //     return;
  //   }
  //   let goods_obj = {
  //     unique_no: this.data.unique_no,
  //     num: this.data.num
  //   }
  //   let goods_list = this.data.goodsList;
  //   goods_list.push(goods_obj);
  //   this.setData({
  //     num: 1,
  //     goodsList:goods_list,
  //     initNum: false
  //   });
  //   //执行扫一扫
  //   this.scan();
  // },
  //点击删除商品
  deleteGoods(v) {
    let index = v.target.dataset.index;
    let new_goods_list = this.data.goodsList;
    new_goods_list.splice(index, 1);
    this.setData({
      goodsList: new_goods_list
    })
  },
  //点击确认退货
  showBall() {
    if (this.data.goodsList.length > 0) {
      this.setData({
        isBall: true
      })
    } else {
      dd.showToast({
        type: 'none',
        content: "还没有商品哦~",
        duration: 2000
      });
    }
  },
  //监听退错原因
  checkRemark(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  //关闭确认退货弹框
  closeBall() {
    this.setData({
      isBall: false,
      isfocus: true
    })
  },
  //监听仓库
  bindObjPickerChange(e) {
    this.setData({
      wms_index: e.detail.value
    })
  },
  //确认退货
  ok() {
    if (this.data.remark == '') {
      dd.showToast({
        type: 'none',
        content: "请填写退回原因",
        duration: 2000
      });
      return;
    }
    let arg = {
      reason: this.data.remark,
      wms_co_id: this.data.wms_list[this.data.wms_index].wms_co_id,
      check_type: this.data.is_verify,
      supplier_id: this.data.id
    }
    let no_arr = [];
    this.data.goodsList.map(item => {
      let no_str = item.unique_no + '_' + item.num;
      no_arr.push(no_str);
    })
    arg['unique_no'] = no_arr.join(',');
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'goods/batch_return',
      method: 'POST',
      data: arg,
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
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
  //点击重置
  reset() {
    if (this.data.goodsList.length > 0) {
      dd.confirm({
        title: '提示',
        content: '确定重置并删除所有商品吗？',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: (result) => {
          if (result.confirm == true) {
            this.setData({
              goodsList: []
            })
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
        content: "还没有商品哦~",
        duration: 2000
      });
    }

  }

});