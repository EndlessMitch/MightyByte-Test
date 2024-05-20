const expressSSE = require('express-sse'),

SSEClass = class extends expressSSE {
  constructor(...args) {
    super(...args);
  }

  init(req, res) {
    if(!req.cookies.sessionId){
      res.end()
      return
    }

    super.init(req, res);
    res.write('retry: 10000\n\n');

    req.on("close", ()=>{
      globalLogger.info("Client disconnect")
    })
  }
},

SSE = new SSEClass();

module.exports = SSE;
