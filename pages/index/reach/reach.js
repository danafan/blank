Page({
  data: {
    packageId: "",               //扫描的包裹id
    packageObj: {},              //包裹详情
    isModel: false,        //默认上传凭证弹框不显示
    imgSrc: "",            //展示的图片地址
    imgObj: {},            //可传递的图片对象
  },
  onLoad() {
    //获取扫描的包裹id
    this.setData({
      packageId: getApp().globalData.codeObj.id
    })
    //获取包裹信息
    this.getPackage();
  },
  //获取包裹信息
  getPackage() {
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'arrive/getpackageinfo',
      method: 'GET',
      data: {
        packageId: this.data.packageId,
        type: "1"
      },
      dataType: 'json',
      success: (res) => {
        var data = res.data;
        if (data.code == 1) {
          this.setData({
            packageObj: data.data
          });
        } else {
          dd.showToast({
            type: 'none',
            content: data.msg,
            duration: 2000,
            success: res => {
              dd.navigateBack({
                delta: 1
              })
            }
          });
        }
      }
    });
  },
  //点击确认到达
  showModel(){
    this.setData({
        isModel: true
      });
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
  //确认到达
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
        content: '正在取货...'
      });
      dd.uploadFile({
        url: getApp().globalData.baseurl + 'supplier/upload_evidence',
        fileType: 'image',
        fileName: 'evidence',
        filePath: this.data.imgSrc,
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.code == '1') {
            //取货
            this.ok(data.img_url);
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
  //提交确认到达
  ok(url) {
    dd.showLoading({
      content: '正在提交，请稍后...'
    });
    dd.httpRequest({
      url: getApp().globalData.baseurl + 'arrive/confirmarrive',
      method: 'GET',
      data: {
        packageId: this.data.packageId,
        img_url: url
      },
      dataType: 'json',
      success: (res) => {
        dd.hideLoading();
        var data = res.data;
        if (data.code == 1) {
          dd.showToast({
            type: 'none',
            content: "已到达",
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
  //取消
  qu() {
    this.setData({
      imgSrc: "",
      imgObj: {},
      isModel: false
    });
  }
});