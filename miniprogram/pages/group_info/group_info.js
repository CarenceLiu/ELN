Page({

  data: {
    groupName:"test",
    group_id:-1,
    userName:"Student_1",
    owner:"Owner",
    owner_id:-1,
    adminList:{1111:"Teacher_1"},
    memberList:{123:"Student_1",1:"Student_2"},
    fileList:["file_1","file_2","file_3"],
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
        res.eventChannel.emit('toGroupFile',{data:[that.groupName,that.group_id,that.fileList]})
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
      var addr_1 = "memberList."+ _data.idInput;
      var addr_2 = "memberSelect."+_data.idInput;
      this.setData({
        [addr_1]:"Student_"+_data.idInput,
        [addr_2]:false
      })
    }
  },

  //删除群组成员事件
  deleteMember(e){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:true
    })
  },

  //管理成员身份事件
  manageMember(e){
    this.setData({
      addPattern:false,
      managePattern:true,
      deletePattern:false
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
    var tmp_admin = this.data.adminList;
    var tmp_member = this.data.memberList;
    var tmp_admin_select = {};
    var tmp_member_select = {};
    for(var key in this.data.adminSelect){
      if(this.data.adminSelect[key]){
        delete tmp_admin[key];
      }
      else{
        tmp_admin_select[key] = false;
      }
    }
    for(var key in this.data.memberSelect){
      if(this.data.memberSelect[key]){
        delete tmp_member[key];
      }
      else{
        tmp_member_select[key] = false;
      }
    }
    console.log(tmp_admin)
    console.log(tmp_member)
    this.setData({
      adminList: tmp_admin,
      memberList: tmp_member,
      adminSelect: tmp_admin_select,
      memberSelect: tmp_member_select,
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
    /*
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('toGroupInfo',(res) =>{
      console.log(res.data);
      that.setData({
        groupName:res.data[0],
        group_id:res.data[1]
      })
    })
    */
   //对选择列表初始化
    for(var key in that.data.adminList)
    {
      that.data.adminSelect[key] = false;
    }
    for(var key in that.data.memberList)
    {
      that.data.memberSelect[key] = false;
    }
  },

  onShow(){
    this.setData({
      addPattern:false,
      managePattern:false,
      deletePattern:false
    })
  }
})