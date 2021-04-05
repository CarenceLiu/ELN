async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

Page({

  data: {
    sourcePath: '',
    dstFilePath: '',
    sourceName: '',
    content: ''
  },

  chooseFile(e) {
    var self = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const x = res.tempFiles[0].path
        const y = res.tempFiles[0].name
        console.log('选择', res)
        self.setData({
          sourcePath: x,
          sourceName: y
        })
      }
    })
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

  

  async uploadFile() {
    this.readFileChosen()
    await timeout(500)
    var contractID = "logbook"
    var operation = "insertDoc"
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    console.log(this.data.sourceName)
    console.log(this.data.content)
    var user_id = "123456"
    var arg = {
      user_id: user_id,
      user_name: "zxt",
      doc_id: user_id + ' ' + this.data.sourceName,
      content: this.data.content ,
    }
    const key = sm2.generateKeyPairHex()
    var publicKey = key.publicKey
    var privateKey = key.privateKey
    const iHtml = "/SCIDE/SCManager?action=executeContract&contractID=" + contractID +
      "&operation=" + operation +
      "&arg=" + JSON.stringify(arg) +
      "&pubkey=" + publicKey + "&signature=";
    const toSign = contractID + "|" + operation + "|" + arg + "|" + publicKey;
    const signature = sm2.doSignature(toSign, privateKey, {
      hash: true,
      der: true
    });

    var url = urlPre + iHtml + signature;
    console.log(url)
    console.log(JSON.stringify(arg))
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        console.log(res)
        console.log('success')
      },
      fail: function (err) {
        console.log(err)
      }
    })
  }
})