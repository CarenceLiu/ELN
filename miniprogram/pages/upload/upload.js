var app = getApp()  // Get global information
async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

Page({

  data: {
    sourcePath: '',  // local file path 
    dstFilePath: '',
    sourceName: '', // file name
    content: '' // file content
  },
  
  // Choose message files in mobile phones,
  // Choose all files in computers.
  chooseFile(e) {
    var self = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const x = res.tempFiles[0].path
        const y = res.tempFiles[0].name
        console.log('选择', res)
        // Set file path and file name
        self.setData({
          sourcePath: x,
          sourceName: y
        })
      }
    })
  },
  
  // Read the chosen file and encode it to a "base64" string
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

  // Upload the file to the db by https request with "POST" method
  async uploadFile() {
    this.readFileChosen()
    await timeout(500)
    // Args when calling the contract's operation
    var contractID = "logbook"
    var operation = "insertDoc"
    const sm2 = require('miniprogram-sm-crypto').sm2
    var urlPre = "https://023.node.internetapi.cn:21030"
    var userID = app.globalData.student_id
    var arg = {
      user_id: userID,
      user_name: app.globalData.realName,
      doc_id: userID + " " + this.data.sourceName,
      content: this.data.content,
    }
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
    
    // URL, do not forget to add the first sign
    var url = urlPre + iHtml + "?pubKey=abc&sign=def"
    console.log(url)
    console.log(JSON.stringify(arg))
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
})
