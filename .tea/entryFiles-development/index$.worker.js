if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');


var AFAppX = self.AFAppX;
self.getCurrentPages = AFAppX.getCurrentPages;
self.getApp = AFAppX.getApp;
self.Page = AFAppX.Page;
self.App = AFAppX.App;
self.my = AFAppX.bridge || AFAppX.abridge;
self.abridge = self.my;
self.Component = AFAppX.WorkerComponent || function(){};
self.$global = AFAppX.$global;


function success() {
require('../../app');
require('../../components/signature/signature');
require('../../pages/index/index');
require('../../pages/index/takingGoods/takingGoods');
require('../../pages/index/package/package');
require('../../pages/index/truck/truck');
require('../../pages/index/getoff/getoff');
require('../../pages/index/reach/reach');
require('../../pages/index/sendback/sendback');
require('../../pages/index/void/void');
require('../../pages/index/packDetail/packDetail');
require('../../pages/index/packageDetail/getdetail');
require('../../pages/index/carDetail/cardetail');
require('../../pages/index/allRecoed/allRecoed');
require('../../pages/index/record/record');
require('../../pages/index/sign/sign');
require('../../pages/index/allPackage/allPackage');
require('../../pages/index/record/detail/detail');
require('../../pages/index/record/detail/goods/goods');
require('../../pages/index/claimGoods/claimGoods');
require('../../pages/index/printer/printer');
require('../../pages/index/getPackageRecord/getPackageRecord');
require('../../pages/index/allPackage/allPackage');
require('../../pages/index/returnRoom/returnRoom');
require('../../pages/index/allRecoed/allRecoed');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}