//封装request
const request = (params) => {
  //返回
  return new Promise((resolve, reject) => {
      wx.request({
          //解构params获取请求参数
          ...params,
          success: (result) => {
              resolve(result);
          },
          fail: (err) => {
              reject(err);
          }
      });
  });
}


Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    nickName :"",
    college : "",
    history:[]
  },

  //拼装请求url
  request_url(op,arg) {
    var contractID = "logbook"
    var operation = op
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var id = this.data.student_id
    const key = sm2.generateKeyPairHex()
    var publicKey = key.publicKey
    var privateKey = key.privateKey
    const iHtml = "/SCIDE/SCManager?action=executeContract&contractID=" + contractID +
      "&operation=" + operation +
      "&arg=" + arg +
      "&pubkey=" + publicKey + "&signature=";
    const toSign = contractID + "|" + operation + "|" + arg + "|" + publicKey;
    const signature = sm2.doSignature(toSign, privateKey, {
      hash: true,
      der: true
    });

    var url = urlPre + iHtml + signature;
    return url;
  },
  
  affirm:function(e){
    var that = this;
    var current = [that.data.nickName,that.data.college];
    if(current.join() != that.data.history.join())
    {
      console.log("尝试更改信息")
      var app = getApp();
      var arg = {user_id:app.globalData.student_id,user_college:that.data.college,nick_name:that.data.nickName};
      arg = JSON.stringify(arg);
      var url = that.request_url("modify_user_personal_info",arg);
      wx.request({
        url: url,
        method:'GET',
        success:function(res){
          console.log(res)
          if(res.data.result == "success"){
            app.globalData.nickName = that.data.nickName;
            app.globalData.college = that.data.college;
            wx.showToast({
              title: '修改成功',
              icon:"none",
              duration:1000,
              success:function(){
                wx.switchTab({
                  url: '../user_info/user_info',
                },1000);
              }
            })
          }
        }
      })
    }
    wx.switchTab({
      url: '../user_info/user_info',
    })
  },

  nickNameInput: function(e){
    this.setData({
      nickName: e.detail.value
    })
  },
  schoolInput: function(e){
    this.setData({
      school: e.detail.value
    })
  },
  collegeInput: function(e){
    this.setData({
      college: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var app = getApp()
    that.setData({
      nickName: app.globalData.nickName,
      college: app.globalData.college,
      history:[app.globalData.nickName,app.globalData.college]
    })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
 
  },
 
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
 
  },
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
 
  },
 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
 
  }
})