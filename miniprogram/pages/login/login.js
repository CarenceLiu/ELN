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
  data:{
    realName:"",
    student_id:"",
    result:""
  },


  request_url(op) {
    var contractID = "logbook"
    var operation = op;
    var app = getApp()
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var id = this.data.student_id
    var arg = undefined
    if(op == "insertUser"){
      arg = {user_id: id, user_name: this.data.realName, head_sculpture:app.globalData.avatarUrl,nick_name:app.globalData.nickName}
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

  //登录按钮事件
  async signIn(e){
    var that = this;
    if(this.data.realName.length == 0||this.data.student_id.length == 0){
      wx.showToast({
        title: '姓名学号不能为空',
        icon:'none',
        duration:2000
      })
    } else{
      var url = that.request_url("query_user_personal_info");
      var info = await request({
        url: url,
        method: 'GET'
      });
      console.log(info);
      that.data.result = info.data.result;
      var ans =  JSON.parse(that.data.result)
      if(ans.query_result){
        wx.showToast({
          title: '登录成功',
          icon:"none",
          duration:1000,
          success:function(){
            var app = getApp();
            app.globalData.student_id = ans.user_id;
            app.globalData.realName = ans.user_name;
            app.globalData.nickName = ans.nick_name;
            app.globalData.college = ans.user_college;
            app.globalData.avatarUrl = ans.head_sculpture;
            console.log("in toast success")
            wx.switchTab({
              url: '../index/index',
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

  //注册按钮事件
  async signUp(e){
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
      var url = that.request_url("query_user");
      var info = await request({
        url: url,
        method: 'GET'
      });
      that.data.result = info.data.result;
      var ans =  JSON.parse(that.data.result)
      ans = ans.query_result
      if(ans){
        wx.showToast({
          title: '用户已存在',
          icon:"none",
          duration:2000
        })
      } else {
        wx.getUserProfile({
          desc:'授权获取信息',
          success: function(res) {
            console.log("getUserProfile")
            console.log(res)
            var app = getApp();
            var userInfo = res.userInfo;
            var nickName = userInfo.nickName
            var avatarUrl = userInfo.avatarUrl
            app.globalData.nickName = nickName
            app.globalData.avatarUrl = avatarUrl
            app.globalData.realName = that.data.realName
            app.globalData.student_id = that.data.student_id
            url = that.request_url("insertUser")
            wx.request({
              url: url,
              method: 'GET',
              success:function(){
                wx.showToast({
                  title: '注册成功',
                  icon:"none",
                  duration:2000
                })
              }
            });
          },
          fail:function(err){
            console.log(err)
          }
        })
      }
    }
  }

})