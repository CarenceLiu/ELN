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
    groupName:"",
    group_id:"",
    userName:"",
    owner:"",
    owner_id:-1,
    adminList:{},
    memberList:{},
    //权限
    addPattern: false,
    deletePattern: false,
    managePattern: false,
    isOwner:true,
    isAdmin:true,
    //选择bool字典
    adminSelect:{},
    memberSelect:{},
    //输入框内容
    idInput:"",
    hasAdded:false
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

  //查看群组文件事件
  switchToGroupFile(e){
    console.log(e)
    var that = this.data
    //进行后续处理
    //切换到groupInfo界面
    wx.navigateTo({
      url: '../group_file/group_file',
      //传送信息到groupInfo
      success:function(res){
        res.eventChannel.emit('toGroupFile',{data:[that.groupName,that.group_id]})
      }
    })
  },

  //添加群组成员按钮事件
  addMember(e){
    this.setData({
      addPattern:true,
      managePattern:false,
      deletePattern:false
    })
  },

  //add输入框事件
  addInput(e){
    this.setData({
      hasAdded: false
    })
    this.data.idInput = e.detail.value
  },

  //添加群组成员 完成按钮事件
  finishAdd(e){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:false
    })
  },

  //添加群组成员 添加按钮事件
  affirmAdd(e){
    var _data = this.data;
    var addID = _data.idInput;
    if(addID in _data.memberList||addID in _data.adminSelect){
      this.setData({
        hasAdded: true
      })
    }
    else{
      //需要判断是否在数据库中
      var that = this;
      var arg = {group_id:_data.group_id,mem_list:[addID]};
      arg = JSON.stringify(arg);
      console.log(arg)
      var url = that.request_url("insertGroupMem",arg)
      wx.request({
        url: url,
        method: 'GET',
        success:function(res){
          console.log(res);
          res = JSON.parse(res.data.result);
          if(res.result == "success")
          {
            console.log("yes")
            arg = _data.idInput;
            console.log(arg)
            arg = JSON.stringify(arg);
            url = that.request_url("query_user_personal_info",arg)
            wx.request({
              url: url,
              method:"GET",
              success:function(res){
                console.log(res)
                res = res.data.result;
                res = JSON.parse(res);
                if(res.query_result){
                  var addr_1 = "memberList."+ _data.idInput;
                  var addr_2 = "memberSelect."+_data.idInput;
                  that.setData({
                    [addr_1]:res.user_name,  //需要修改为用户真实姓名
                    [addr_2]:false
                  })
                }
              }
            })
        }
        }
      })
    }
  },

  //删除群组成员事件
  deleteMember(e){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:true,
      hasAdded:false
    })
  },

  //管理成员身份事件
  manageMember(e){
    this.setData({
      addPattern:false,
      managePattern:true,
      deletePattern:false,
      hasAdded:false
    })
  },

  //确认更改事件
  affirmManage(e){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:false
    })
    this.data.adminSelect = {};
    this.data.memberSelect = {};
    for(var key in this.data.adminList)
    {
      this.data.adminSelect[key] = false;
    }
    for(var key in this.data.memberList)
    {
      this.data.memberSelect[key] = false;
    }
    console.log(this.data)
  },

  //移除按钮事件
  affirmDelete(e){
    var that = this;
    var tmp_admin = this.data.adminList;
    var tmp_member = this.data.memberList;
    var tmp_admin_select = {};
    var tmp_member_select = {};
    var admin_delete = [];
    var member_delete = [];
    for(var key in this.data.adminSelect){
      if(this.data.adminSelect[key]){
        admin_delete.push(key);
        delete tmp_admin[key];
      }
      else{
        tmp_admin_select[key] = false;
      }
    }
    for(var key in this.data.memberSelect){
      if(this.data.memberSelect[key]){
        member_delete.push(key);
        delete tmp_member[key];
      }
      else{
        tmp_member_select[key] = false;
      }
    }
    var arg = {group_id:that.data.group_id,mem_list:member_delete};
    arg = JSON.stringify(arg);
    var url = that.request_url("deleteGroupMem",arg);
    wx.request({
      url: url,
      method:"GET",
      success:function(res){
        console.log(res);
        res = JSON.parse(res.data.result);
        if(res.result == "success")
        {
          that.setData({
            adminList: tmp_admin,
            memberList: tmp_member,
            adminSelect: tmp_admin_select,
            memberSelect: tmp_member_select,
            deletePattern: false
          })
        }
      }
    })
    that.setData({
      deletePattern: false
    })
  },

  //管理员选择事件
  selectAdmin(e){
    var key = e.currentTarget.dataset.index;
    var _data = this.data;
    if(_data.deletePattern&&_data.isOwner){
      var addr = "adminSelect."+key;
      this.setData({
        [addr]:!_data.adminSelect[key]
      })
    }
    else if(_data.managePattern&&_data.isOwner){
      var addr = "memberList."+key;
      var name = _data.adminList[key];
      var tmp_admin = _data.adminList;
      delete tmp_admin[key];
      this.setData({
        [addr]:name,
        adminList:tmp_admin
      })
    }
  },

  //成员选择事件
  selectMember(e){
    var key = e.currentTarget.dataset.index;
    var _data = this.data;
    if(_data.deletePattern&&(_data.isOwner||_data.isAdmin)){
      var addr = "memberSelect."+ key;
      this.setData({
        [addr]:!_data.memberSelect[key]
      })
    }
    else if(_data.managePattern&&_data.isOwner){
      var addr = "adminList."+key;
      var name = _data.memberList[key];
      var tmp_member = _data.memberList;
      delete tmp_member[key];
      this.setData({
        [addr]:name,
        memberList:tmp_member
      })
    }
  },
  
  onLoad(){
    console.log("onLoad")
    //用于接受groupList参数
    var that = this;
    var tmp_group_name ="";
    var tmp_group_id = "";
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('toGroupInfo',(res) =>{
      console.log(res.data);
      tmp_group_name = res.data[0];
      tmp_group_id = res.data[1];
    })

    var arg = tmp_group_id;
    console.log(arg);
    arg = JSON.stringify(arg);
    var url = that.request_url("query_group_info",arg);
    wx.request({
      url: url,
      method:"GET",
      success:function(res){
        console.log(res);
        res = JSON.parse(res.data.result);
        var tmp_member = {};
        for(var i = 1; i < res.user_list.length ; i++)
        {
          var tmp = res.user_list[i];
          tmp_member[tmp.user_id] = tmp.user_name;
        }
        that.setData({
          owner_id:res.owner_id,
          owner:res.owner_name,
          memberList:tmp_member,
          groupName:tmp_group_name,
          group_id:tmp_group_id,
          userName:getApp().globalData.realName
        })
        //对选择列表初始化
        /*for(var key in that.data.adminList)
        {
          that.data.adminSelect[key] = false;
        }*/
        for(var key in tmp_member)
        {
          that.data.memberSelect[key] = false;
        }
      }
    })


  },

  onShow(){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:false
    })
  }
})