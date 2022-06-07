Page({
  data: {
    packageList: [],      //当前车辆的包裹列表   
    isModel: false,        //默认上传凭证弹框不显示
    imgSrc: "",            //展示的图片地址
    imgObj: {},            //可传递的图片对象   
  },
  onLoad() {
    this.setData({
      packageList: []
    })
  },
  //扫描包裹二维码增加包裹
  scan() {
    //弹出扫描二维码的框
    dd.scan({
      type: 'qr',
      success: (res) => {
        if (res.code.indexOf("type") > -1) {
          var codeObj = JSON.parse(res.code)
          if (codeObj.type != "1") {    //扫描的不是包裹
            dd.showToast({
              type: 'none',
              content: "请扫描包裹码",
              duration: 2000
            });
          } else if (this.judge(codeObj.id) == false) {
            dd.showToast({
              type: 'none',
              content: "请勿重复扫描",
              duration: 2000
            });
          } else {
            //添加包裹
            this.addPackage(codeObj);
          }
        } else {
          dd.showToast({
            type: 'none',
            content: "请扫描包裹码",
            duration: 2000
          });
        }
      }
    });
  },
  //判断是否重复扫描
  judge(id) {
    let aa = true;
    for (var i = 0; i < this.data.packageList.length; i++) {
      if (this.data.packageList[i].id == id) {
        return aa = false;
      } else {
        aa = true;
      }
    }
    return aa;
  },
  //添加包裹
  addPackage(codeObj) {
    //传递包裹id和type添加包裹
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'arrive/getpackageinfo',
      method: 'GET',
      data: {
        packageId: codeObj.id,
        type: "1"
      },
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          this.data.packageList.unshift(data.data)
          this.setData({
            packageList: this.data.packageList    //包裹列表
          });
          dd.showToast({
            type: 'none',
            content: "扫描成功",
            duration: 1000
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
  //点击某一条的删除
  deletes(e) {
    dd.confirm({
      title: '提示',
      content: '确认删除该包裹吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm == true) {
          let index = e.currentTarget.dataset.index;
          let arr = this.data.packageList;
          arr.splice(index, 1);
          this.setData({
            packageList: arr
          });
        } else {
          dd.showToast({
            type: 'none',
            content: "取消删除",
            duration: 2000
          });
        };
      },
    });
  },
  //点击完成
  goIndex() {
    if (this.data.packageList.length == 0) {
      dd.showToast({
        type: 'none',
        content: "一个包裹都没有",
        duration: 2000
      })
    } else {
      var isSet = true;
      var gys_id = this.data.packageList[0].supplier_id;
      this.data.packageList.map((item, index) => {
        if (item.supplier_id != gys_id) {
          isSet = false;
          return;
        }
      });
      if (isSet == true) {
        this.setData({
          isModel: true
        });
      } else {
        dd.confirm({
          title: '提示',
          content: '以上商品不是同一个供应商哦，确认送达吗？',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          success: (result) => {
            if (result.confirm == true) {
              this.setData({
                isModel: true
              });
            } else {
              dd.showToast({
                type: 'none',
                content: "取消送达",
                duration: 2000
              });
            };
          },
        });
      }

    }
  },
  //点击上传图片
  uploadImg() {
    dd.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          imgObj: res,
          imgSrc: res.apFilePaths[0]
        })
      },
    });
  },
  //点击删除图片
  deleteImg() {
    this.setData({
      imgObj: {},
      imgSrc: ""
    });
  },
  //确认取货
  claim() {
    if (this.data.imgSrc == "") {
      dd.showToast({
        type: 'none',
        content: "请上传到达凭证",
        duration: 2000
      });
    } else {
      //上传
      dd.showLoading({
        content: '正在送达...'
      });
      dd.uploadFile({
        url: getApp().globalData.baseurl + 'supplier/upload_evidence',
        fileType: 'image',
        fileName: 'evidence',
        filePath: this.data.imgSrc,
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.code == '1') {
            //送达
            this.getHuo(data.img_url);
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
  //取货
  getHuo(url) {
    let arr = [];
    this.data.packageList.map(item => {
      arr.push(item.id);
    });
    let obj = {
      img_url: url,
      packageId: arr.join(","),
    }
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'arrive/confirmarrive',
      method: 'GET',
      data: obj,
      dataType: 'json',
      success: (res) => {
        dd.hideLoading();
        var data = res.data;
        if (data.code == 1) {
          dd.showToast({
            type: 'none',
            content: "已送达",
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
  //取消取货
  qu() {
    this.setData({
      imgSrc: "",
      imgObj: {},
      isModel: false
    });
  }

});