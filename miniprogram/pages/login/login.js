// The initial user page
async function timeout(ms) {    // the "sleep" function
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

Page({
  data:{    // user info
    realName:"",
    student_id:"",
    result:""
  },

  // Send request to the db for user information
  // arg is a JSON formatted string ({"user_id": xxx, "user_name": xxxx})
  // if inserting user to the db, or a string indicating user_id if querying
  // the user's existence.
  request_for_user(op) {
    var self = this
    var contractID = "logbook"
    var operation = op
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var id = this.data.student_id
    var arg = undefined
    if(op == "insertUser"){   // Sign up
      arg = {user_id: id, user_name: this.data.realName}
      arg = JSON.stringify(arg)
    }
    else {      // Sign in
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

    var url = urlPre + iHtml + signature; // the https request's url
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
  
  // The input event function
  nameInput: function(e){
    this.setData({
      realName: e.detail.value
    })
  },

  // The input event function
  idInput: function(e){
    this.setData({
      student_id: e.detail.value
    })
  },

  // The sign-in button
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
        // The response shows the user's existence in the db,
        // which means a legal sign-in
        wx.showToast({
          title: '登录成功',
          icon:"none",
          duration:1000,
          success:function(){
            setTimeout(function(){
              wx.getUserInfo({    // Modify global user info variables
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
                url: '../index/index',    // Jump to page index
              })
            },1000);
          }
        })
      }
      else{   // No such user in db
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

  //The sign-up button
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
      if(ans){    // The user has signed up already
        wx.showToast({
          title: '用户已存在',
          icon:"none",
          duration:2000
        })
      } else {    // The user does not exist, signing up successfully.
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
