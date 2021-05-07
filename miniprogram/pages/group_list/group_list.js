Page({

  data: {
    joinList: {1:"hello",2:"world"},
    createList:{4:"你好",3:"世界"}
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
  }

})