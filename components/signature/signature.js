Component({
  data: {
    hasDraw: false,
    canvasWidth: 0,
    canvasHeight: 0,
    startPoint: {
      x: 0,
      y: 0,
    },
    lineColor: '#1A1A1A', // 颜色
    radius: 3, //画圆的半径
  },  
  didMount() {
    this.canvasCtx = dd.createCanvasContext('signature')
    // 设置线的样式
    this.canvasCtx.setLineCap("round");
    this.canvasCtx.setLineJoin("round");
    // 初始化颜色
    this.canvasCtx.setStrokeStyle('black');
    dd.createSelectorQuery().select('.modal-canvas').boundingClientRect().exec(rect => {
      this.setData({
        canvasWidth: rect[0].width,
        canvasHeight: rect[0].height,
      });
    });
  },
  props: {
    onGetImgUrl: () => { }
  },
  methods: {  // 自定义方法
    //点击
    scaleStart(event) {
      if (event.type != "touchStart") return false;
      let currentPoint = {
        x: event.touches[0].x,
        y: event.touches[0].y
      }
      this.drawCircle(currentPoint);
      this.setData({
        startPoint: currentPoint,
        hasDraw: true, //签字了
      });
    },
    //滑动
    scaleMove(event) {
      if (event.type != "touchMove") return false;
      let {
        startPoint
      } = this.data
      let currentPoint = {
        x: event.touches[0].x,
        y: event.touches[0].y
      }
      this.drawLine(startPoint, currentPoint)
      this.setData({
        startPoint: currentPoint
      })
    },
    drawCircle(point) { //这里负责点
      let ctx = this.canvasCtx;
      ctx.beginPath();
      ctx.setFillStyle(this.data.lineColor)
      //笔迹粗细由圆的大小决定
      ctx.arc(point.x, point.y, this.data.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      ctx.draw(true)
    },
    drawLine(sourcePoint, targetPoint) {
      let ctx = this.canvasCtx;
      this.drawCircle(targetPoint);
      ctx.beginPath();
      ctx.setStrokeStyle(this.data.lineColor)
      ctx.setLineWidth(this.data.radius * 2)
      ctx.moveTo(sourcePoint.x, sourcePoint.y);
      ctx.lineTo(targetPoint.x, targetPoint.y);
      ctx.stroke();
      ctx.closePath();
    },
    //清空画布
    clearCanvas() { 
      let ctx = this.canvasCtx;
      ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      ctx.draw()
      this.setData({
        hasDraw: false //未签字
      })
    },
    //生成图片
    saveToImage() {
      let {
        hasDraw,
        canvasHeight,
        canvasWidth
      } = this.data
      let that = this
      if (!hasDraw) {
        dd.showToast({
          type: 'none',
          content: '还未签字哟！',
          duration: 2000
        });
        return
      }
      this.canvasCtx.toTempFilePath({
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        success: (res) => {
          this.uploadImg(res.filePath);
        },
        fail(err) {
          console.log(err);
        }
      });
    },
    // 上传图片
    uploadImg(imgSrc) {
      dd.uploadFile({
        url: getApp().globalData.baseurl + 'supplier/upload_evidence',
        fileType: 'image',
        fileName: 'evidence',
        filePath: imgSrc,
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.code == '1') {
            //清空画布
            this.clearCanvas();
            //回传图片地址
            this.props.onGetImgUrl('2',data.img_url);
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
    //关闭
    closeFn(){
      //清空画布
      this.clearCanvas();
      this.props.onGetImgUrl('1','');
    }
  },
})