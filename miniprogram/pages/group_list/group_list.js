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

  data: {
    joinList: {},
    createList:{},
    isCreate:false,
    hasCreated:false,
    inputCreateName:""
  },

  //拼装请求url
  request_url(op, arg) {
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

  switchToGroup(e){
    console.log(e)
    var groupName = e.currentTarget.dataset.text
    var group_id = e.currentTarget.dataset.value
    //进行后续处理
    //切换到groupInfo界面
    wx.navigateTo({
      url: '../group_info/group_info',
      //传送信息到groupInfo
      success:function(res){
        res.eventChannel.emit('toGroupInfo',{data:[groupName,group_id]})
      }
    })
  },

  inputName(e){
    this.setData({
      isCreate:true
    })
  },

  inputCreateName(e){
    this.setData({
      hasCreated: false
    })
    this.data.inputName = e.detail.value
  },

  createGroup(e){
    var app = getApp();
    var that = this;
    //根据用户身份
    if(that.data.inputName.length == 0){
      wx.showToast({
        title: '群名称不能为空',
        icon:'none',
        duration:2000
      })
    }
    else{
      var name = that.data.inputName;
      var id = app.globalData.student_id+" "+name;
      console.log(id);
      if(id in that.data.createList){
        that.setData({
          hasCreated:true
        })
      }
      else{
        var arg = {group_id: id, group_name: name, owner_id: app.globalData.student_id};
        arg = JSON.stringify(arg);
        var url = this.request_url("insertGroup",arg);
        console.log(url);
        wx.request({
          method: 'GET',
          url: url,
          success:function(res){
            console.log("success request")
            console.log(res)
            if(res.data.result[0] == '{') //奇怪的判断
            var addr = "createList."+id;
            that.setData({
              [addr]:name,
              hasCreated:false,
              isCreate:false,
              inputName:""
            })
          }
        })
      }
    }
  },

  onLoad(){
    var that = this;
    var app = getApp();
    var arg = app.globalData.student_id;
    arg = JSON.stringify(arg);
    console.log(arg);
    var url = that.request_url("query_user_group",arg);
    wx.request({
      url: url,
      method:"GET",
      success:function(res){
        console.log(res);
        res = JSON.parse(res.data.result);
        console.log("successful parse")
        var tmp_create = {};
        var tmp_join = {};
        console.log(res);
        for(var i = 0; i < res.create_list.length; i ++)
        {
          var tmp = res.create_list[i];
          console.log(tmp)
          tmp_create[tmp["group_id"]] = tmp["group_name"];
        }
        for(var i = 0; i < res.join_list.length; i++)
        {
          var tmp = res.join_list[i];
          console.log(tmp)
          tmp_join[tmp["group_id"]] = tmp["group_name"];
        }
        that.setData({
          joinList: tmp_join,
          createList: tmp_create
        })
      }
    })

  }

})