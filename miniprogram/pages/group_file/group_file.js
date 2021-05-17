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

var app = getApp();

async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}


Page({

  data: {
    groupName:"",
    group_id:-1,
    fileList:[],
    sourcePath: '',
    dstFilePath: '',
    sourceName: '',
    content: ''
  },

  //拼装请求url
  request_url(op,arg) {
    var contractID = "logbook"
    var operation = op
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
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

  readFileChosen() {
    var self = this
    var FlieSystemManager = wx.getFileSystemManager()
    FlieSystemManager.readFile({
      filePath: this.data.sourcePath,
      encoding: "base64",
      success: function (res) {
        self.setData({
          content: res.data
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  
  //上传群组文件 待完善
  addFile(e){

    var self = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const x = res.tempFiles[0].path
        const y = res.tempFiles[0].name
        console.log('选择', res)
        self.data.sourcePath = x;
        self.data.sourceName = y;
        self.uploadFile();
        // self.setData({
        //   sourcePath: x,
        //   sourceName: y,
        //   success:function(){
        //     self.uploadFile()
        //   }
        // })
      }
    })
  },

  async uploadFile() {
    var that = this;
    this.readFileChosen()
    await timeout(1000)

    var contentsDict = {}
    var cnt = 0
    var contentLen = this.data.content.length
    var seg_size = 10000
    for (var start_pos = 0; start_pos + seg_size < contentLen; start_pos += seg_size) {
      contentsDict[cnt] = [cnt,'']
      contentsDict[cnt][1] = this.data.content.slice(start_pos, start_pos + seg_size)
      cnt += 1
    }
    contentsDict[cnt] = [cnt,'']
    contentsDict[cnt][1] = this.data.content.slice(start_pos, start_pos + seg_size)
    cnt += 1

    // console.log(this.data.content)
    console.log(cnt)
    console.log(contentLen)
    // console.log(contentsDict)


    var contractID = "logbook"
    var operation = "insertDoc"
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var userID = app.globalData.student_id;
    var tmp_group_list = [];
    tmp_group_list.push(that.data.group_id);
    for (var i = 0; i < cnt; i += 1) {
      var arg = {
        user_id: userID,
        group_list:tmp_group_list,
        user_name: app.globalData.realName,
        doc_id: userID + " " + this.data.sourceName,
        content: contentsDict[i],
      }
      console.log(arg)
      const key = sm2.generateKeyPairHex()
      var publicKey = key.publicKey
      var privateKey = key.privateKey
      // const iHtml = "/SCIDE/SCManager?action=executeContract&contractID=" + contractID +
      //   "&operation=" + operation +
      //   "&arg=" + JSON.stringify(arg) +
      //   "&pubkey=" + publicKey + "&signature=";
      const iHtml = "/SCIDE/SCManager"
      const toSign = contractID + "|" + operation + "|" + JSON.stringify(arg) + "|" + publicKey;
      const signature = sm2.doSignature(toSign, privateKey, {
        hash: true,
        der: true
      });

      var url = urlPre + iHtml + "?pubKey=abc&sign=def"
      // console.log(url)
      // console.log(JSON.stringify(arg))
      wx.request({
        url: url,
        data: {
          action: "executeContract",
          contractID: contractID,
          operation: operation,
          arg: JSON.stringify(arg),
          pubkey: publicKey,
          signature: signature,
        },
        dataType: "json",
        method: "POST",
        success: function (res) {
          console.log(res)
          console.log('success')
        },
        fail: function (err) {
          console.log(err)
        }
      })
    }
  },

  
  download(e) {
    console.log(e)
    var doc_id = e.currentTarget.dataset.text
    var self = this
    var operation = "query_doc"
    var arg = doc_id
    //var user_id = this.get_user_id()
    var url = self.request_url(operation,arg);
    console.log(url)
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        console.log(res)
        var tmp = JSON.parse(res.data.result)
        var tmp_content = ""
        var tmp_dict = {}
        for(var i = 0; i<tmp.content.length;i++){
          tmp_dict[tmp.content[i].content[0]] = tmp.content[i].content[1]
        }
        for(var i = 0; i<tmp.content.length;i++){
          tmp_content+=tmp_dict[i]
        }
        var tmp_docid = tmp.content[0].doc_id
        var FlieSystemManager = wx.getFileSystemManager()
        FlieSystemManager.writeFile({
          filePath: wx.env.USER_DATA_PATH + '/' + tmp_docid,
          data: tmp_content,
          encoding: "base64",
          success: function (res) {
            console.log(wx.env.USER_DATA_PATH + '/' + tmp_docid)
          },
          fail: function (err) {
            console.log(err)
          }
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  onLoad(){
    //用于接受groupList参数
    console.log("onload")
    const eventChannel = this.getOpenerEventChannel();
    var that = this;
    eventChannel.on('toGroupFile',(res) =>{
      console.log(res.data);
      that.setData({
        groupName: res.data[0],
        group_id: res.data[1],
      })
      var arg = res.data[1];
      arg = JSON.stringify(arg);
      var url = that.request_url("query_group_doc",arg);
      wx.request({
        url: url,
        method:"GET",
        success:function(res){
          res = res.data.result;
          res = JSON.parse(res);
          if(res.query_result)
          {
            that.setData({
              fileList:res.data
            })
          }
        }
      })
    })
  },
})