var app = getApp()
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
    await timeout(1000)

    var contentsDict = {}
    var cnt = 0
    var contentLen = this.data.content.length
    var seg_size = 100
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
    var userID = app.globalData.student_id

    for (var i = 0; i < cnt; i += 1) {
      var arg = {
        user_id: userID,
        user_name: app.globalData.realName,
        doc_id: userID + " " + this.data.sourceName,
        content: contentsDict[i],
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
  }
})
