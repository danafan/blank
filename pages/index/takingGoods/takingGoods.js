Page({
  data: {
    img_url: "",   //图片地址
    showShopList: false,     //是否显示下拉框
    shopList: [],             //供应商列表
    shop_name: "",           //选中的供应商名称
    shop_id: "",             //选中的供应商ID
    number: "",              //输入的数量
    gys_num: [],             //选中的供应商和数量的列表
    showCarList: false,      //默认车牌列表不显示
    car_no: [],              //车牌号列表
    car_no_name: "请选择车辆（非必选）",         //选中的车牌
    car_no_id: "",           //选中的车牌号id
    show_modal: false,       //默认不显示弹框
  },
  onLoad(query) {
    this.setData({
      img_url: query.imgSrc,
      gys_num:[]
    })
    //获取车牌号列表
    this.getCarNo();
  },
  //搜索框获取焦点事件
  carFocus() {
    this.setData({
      showCarList: !this.data.showCarList
    })
  },
  //获取车牌号列表
  getCarNo() {
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'takegoods/ajaxCarNo',
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          this.setData({
            car_no: data.data,              //车牌号列表
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
  //选中某一个车牌
  selCar(e) {
    this.setData({
      car_no_name: e.target.dataset.name,
      car_no_id: e.target.dataset.id,
      showCarList: false
    })
  },
  //删除车牌
  deleteCl() {
    this.setData({
      car_no_name: "请选择车辆（非必选）",
      car_no_id: ""
    })
  },
  //监听输入的搜索内容
  bindKeyInput(e) {
    this.setData({
      shop_name: e.detail.value
    })
    //获取供应商列表
    this.getShopList();
  },
  //获取供应商列表
  getShopList() {
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'takegoods/ajaxSupplierList',
      method: 'GET',
      data: { name: this.data.shop_name },
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          this.setData({
            shopList: data.data,              //商家列表
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
  //选中某一个供应商
  selShop(e) {
    this.setData({
      shop_name: e.target.dataset.name,
      shop_id: e.target.dataset.id,
      showShopList: false
    })
  },
  //搜索框获取焦点事件
  onfocus() {
    this.getShopList();
    this.setData({
      showShopList: true,
      showCarList: false
    })
  },
  onblur() {
    this.setData({
      showShopList: false
    })
  },
  //关闭弹框
  closeModal() {
    this.setData({
      shop_name: "",
      number: "",
      shop_id: "",
      show_modal: false
    })
  },
  //新增供应商
  addGys() {
    this.setData({
      show_modal: true
    })
  },
  //确认添加
  ok() {
    if (this.data.shop_name == '') {
      dd.showToast({
        type: 'none',
        content: '选择供应商',
        duration: 2000
      });
    } else if (this.data.number == "") {
      dd.showToast({
        type: 'none',
        content: '请输入数量',
        duration: 2000
      });
    } else {
      var is_have = false;
      this.data.gys_num.map(item => {
        if (item.shop_id == this.data.shop_id) {
          is_have = true;
          return;
        }
      });
      if (is_have) {
        dd.showToast({
          type: 'none',
          content: '已存在该供应商，请勿重复添加!',
          duration: 2000
        });
      } else {
        let obj = {
          shop_name: this.data.shop_name,
          number: this.data.number,
          shop_id: this.data.shop_id
        }
        let gys_num_arr = this.data.gys_num;
        gys_num_arr.push(obj);
        this.setData({
          gys_num: gys_num_arr
        })
        this.closeModal();
      }
    }
  },
  //删除选择好的供应商
  deleteGys(e) {
    let index = e.target.dataset.index;
    this.data.gys_num.splice(index, 1);
    this.setData({
      gys_num: this.data.gys_num
    })
  },
  //监听拿货数量
  numberInput(e) {
    this.setData({
      number: e.detail.value
    })
  },
  //上传图片
  uploadImg() {
    if (this.data.gys_num.length == 0) {
      dd.showToast({
        type: 'none',
        content: '至少选择一个供应商',
        duration: 2000
      });
    } else {
      //上传
      dd.showLoading({
        content: '正在提交...'
      });
      dd.uploadFile({
        url: getApp().globalData.baseurl + 'supplier/upload_evidence',
        fileType: 'image',
        fileName: 'evidence',
        filePath: this.data.img_url,
        success: (res) => {
          dd.hideLoading();
          let data = JSON.parse(res.data);
          if (data.code == '1') {
            //取货
            this.submit(data.img_url);
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
  //提交
  submit(img_url) {
    var list = [];
    this.data.gys_num.map(item => {
      let str = item.shop_id + "_" + item.number;
      list.push(str);
    })
    let req = {
      image: img_url,
      list: list.join(','),
      car_id: this.data.car_no_id
    }
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'takegoods/addMany',
      method: 'POST',
      data: req,
      dataType: 'json',
      success: (res) => {
        dd.hideLoading();
        var data = res.data;
        if (data.code == 1) {
          dd.showToast({
            type: 'none',
            content: "已取货",
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
  }
});
