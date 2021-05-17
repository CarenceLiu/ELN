var app = getApp()
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
    for (var i = 0; i < cnt; i += 1) {
      var arg = {
        user_id: userID,
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
  }
})