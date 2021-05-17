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
    nickName : "",
    avatarUrl : "",
    realName :"",
    student_id :"",
    school : "",
    college : "",
  },

  //拼装请求url
  request_url(op) {
    var contractID = "logbook"
    var operation = op
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var id = this.data.student_id
    var arg = undefined
    if(op == "insertUser"){
      arg = {user_id: id, user_name: this.data.realName}
      arg = JSON.stringify(arg)
    }
    else {
      arg = id
    }
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
 
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var app = getApp()
    that.setData({
      avatarUrl: app.globalData.avatarUrl,
      nickName: app.globalData.nickName,
      realName: app.globalData.realName,
      student_id: app.globalData.student_id,
      college:app.globalData.college
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
    var that = this
    var app = getApp()
    console.log(app.globalData)
    that.setData({
      avatarUrl: app.globalData.avatarUrl,
      nickName: app.globalData.nickName,
      realName: app.globalData.realName,
      student_id: app.globalData.student_id,
      college:app.globalData.college
    })
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