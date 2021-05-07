Page({

  data: {
    groupName:"",
    group_id:-1,
    fileList:[]
  },
  
  //上传群组文件
  addFile(e){},

  onLoad(){
    //用于接受groupList参数
    console.log("onload")
    const eventChannel = this.getOpenerEventChannel();
    var that = this;
    eventChannel.on('toGroupFile',(res) =>{
      console.log(res.data[0],res.data[1]);
      that.setData({
        groupName: res.data[0],
        group_id: res.data[1],
        fileList: res.data[2]
      })
      console.log(that.data)
    })
  },
})