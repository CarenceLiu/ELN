async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

Page({
  data:{
    realName:"",
    student_id:"",
    result:""
  },

  request_for_user(op) {
    var self = this
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
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        self.setData({
          result:res.data.result
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  

  nameInput: function(e){
    this.setData({
      realName: e.detail.value
    })
  },

  idInput: function(e){
    this.setData({
      student_id: e.detail.value
    })
  },

   async signIn(){
    var that = this;
    if(this.data.realName.length == 0||this.data.student_id.length == 0){
      wx.showToast({
        title: '姓名学号不能为空',
        icon:'none',
        duration:2000
      })
    } else{
      that.request_for_user("query_user")
      await timeout(300)
      var ans =  JSON.parse(that.data.result)
      ans = ans.query_result
      if(ans){
        wx.showToast({
          title: '登录成功',
          icon:"none",
          duration:1000,
          success:function(){
            setTimeout(function(){
              wx.getUserInfo({
                success: function(res) {
                  var app = getApp();
                  var userInfo = res.userInfo
                  var nickName = userInfo.nickName
                  var avatarUrl = userInfo.avatarUrl
                  app.globalData.nickName = nickName
                  app.globalData.avatarUrl = avatarUrl
                  app.globalData.realName = that.data.realName
                  app.globalData.student_id = that.data.student_id
                }
              })
              wx.switchTab({
                url: '../index/index',
              })
            },1000);
          }
        })
      }
      else{
        that.setData({
          student_id:"",
          realName:""
        })
        wx.showToast({
          title: '用户不存在',
          icon:"none",
          duration:2000
        })
      }
    }
  },

  async signUp(){
    var that = this;
    if(this.data.realName.length == 0||this.data.student_id.length == 0){
      wx.showToast({
        title: '姓名或学号不能为空',
        icon:'none',
        duration:2000,
      })
    }
    // else if(this.data.student_id.length != 10){
    //   wx.showToast({
    //     title: '学号不符合规范',
    //     icon:'none',
    //     duration:2000
    //   })
    // } 
    else {
      that.request_for_user("query_user")
      await timeout(300)
      var ans =  JSON.parse(that.data.result)
      ans = ans.query_result
      if(ans){
        wx.showToast({
          title: '用户已存在',
          icon:"none",
          duration:2000
        })
      } else {
        that.request_for_user("insertUser")
        wx.showToast({
          title: '注册成功',
          icon:"none",
          duration:2000
        })
      }
    }
  }

})