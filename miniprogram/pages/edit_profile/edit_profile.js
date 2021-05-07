
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    nickName : "",
    realName :"",
    school : "",
    college : "",
    history:[]
  },
  
  affirm:function(e){
    var that = this.data;
    if([that.nickName,that.realName,that.school,that.college].toString() != that.history.toString())
    {
      console.log("尝试更改信息")
      //发送更改信息到平台
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
  realNameInput: function(e){
    this.setData({
      realName: e.detail.value
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
      realName: app.globalData.realName,
      college: app.globalData.college,
      school: app.globalData.school,
      history: [that.data.nickName,that.data.realName,that.data.college,that.data.school]
    })
    that.setData({
      nickName : "test",
      realName :"test",
      school : "test",
      college : "test",
      history:["test","test","test","test"]
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