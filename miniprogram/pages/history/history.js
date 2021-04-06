//历史文件界面
//sleep函数，用于等待
async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}
Page({

  data: {
    filenames: [],
    content: ''
  },

  get_user_id() {
    return getApp().globalData.student_id
  },
  //获取上传文件列表
  request_for_doc() {
    var self = this
    var user_id = this.get_user_id()
    var contractID = "logbook"
    var operation = "query_user_info"
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var arg = user_id
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
          filenames: files,
        })
        console.log('success')
        console.log(files)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  //下载文件
  download(e) {
    console.log(e)
    var doc_id = e.currentTarget.dataset.text
    var self = this
    //var user_id = this.get_user_id()
    var contractID = "logbook"
    var operation = "query_doc"
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var arg = doc_id
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
    console.log(url)
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        console.log(res)
        var tmp = JSON.parse(res.data.result)
        var tmp_docid = tmp.content.doc_id
        var tmp_content = tmp.content.content
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