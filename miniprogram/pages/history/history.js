async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

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
    fileList: [],
    content: ''
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

  request_for_doc() {
    var self = this
    var user_id = getApp().globalData.student_id
    var operation = "query_user_info"
    var arg = user_id
    var url = self.request_url(operation,arg);
    console.log(url)
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        console.log(res)
        var files = []
        var tmp = JSON.parse(res.data.result)
        for (var i = 0; i < tmp.data.length; i++) {
          files.push(tmp.data[i])
        }
        self.setData({
          fileList: files,
        })
        console.log('success')
        console.log(files)
      },
      fail: function (err) {
        console.log(err)
      }
    })
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
  async showFile() {
    this.request_for_doc()
    await timeout(500)
    var self = this
    console.log(self.data.content)

  }
})