App({
  globalData: {
    // baseurl: "http://erpdeer.92nu.com/api/",          //德儿正式/
    // baseurl: "http://erphuda.92nu.com/api/",          //乎达正式
    // baseurl: "http://erpwp.92nu.com//api/",           //唯品正式
    baseurl: "http://erpcs.92nu.com/api/",               //测试
    username: "",                                        //用户名
    is_all_package:'0',                                  //是否显示全部记录(0:不显示；1:显示)
    printer:"",                                          //选择的打印机
    codeObj: {}                                          //扫码获取的信息
  },
  onLaunch (options) {
  },
}); 