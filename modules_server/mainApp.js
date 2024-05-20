const express = require('express'),
store = require('./store'),
SSE = require('./sse')
crypto = require("crypto"),
{ status200 } = require('./../util/statusCodes'),
Router = new express.Router(),
ScheduledTask = class{

  #ref;

  constructor(task, timeout){
    this.task = task;
    this.timeout = timeout;
    this.complete = false;
    this.cancelled = false;
    this.#ref = setTimeout(function(){
      if(this.complete || this.cancelled){
        return
      }
      this.complete = true;
      this.task(this);
    }.bind(this), timeout)
    globalLogger.info('Scheduling task');
  }

  cancel(){
    if(!this.cancelled && !this.complete){
      this.cancelled = true;
      globalLogger.info('Cancelling task');
      clearTimeout(this.#ref)
    }
  }
},

/*
  Send SSE message until ACK message returns for session
*/

schedulePush = function(sessionId, url){
  store.getUrlByUrl(url).then((found)=>{
    SSE.send({shortenedURL: "http://localhost:" + process.env.APP_PORT + "/endpoints/" + found.id, urlId: found.id})
  }).then(function(){
    store.setItem('task-' + sessionId, new ScheduledTask(function(task){
      globalLogger.info("Should re-send message", task)
      schedulePush(sessionId, url)
    }, 1000 * 10))
  });
};

Router.post("/url", (req, res)=>{

  store.getUrlByUrl(req.body.url).then((found)=>{
    if(!found){
      return store.updateItem('urls', function(prev){
        prev.push({url: req.body.url, id: crypto.randomBytes(5).toString('hex')})
        return prev
      })
    }
    return new Promise(function(resolve){resolve()})
  }).then(()=>{
    status200(req, res)
    schedulePush(req.cookies.sessionId, req.body.url)
  })

})

Router.post("/ack/:urlId", (req, res)=>{
  store.getItem('task-' + req.cookies.sessionId).then((t)=>{
    if(t){
      t.cancel()
      store.removeItem('task-' + req.cookies.sessionId)
    }
    status200(req, res)
  });

})

Router.get("/:urlId", (req, res)=>{
  store.getUrlById(req.params.urlId).then((found)=>{
    if(found){
      res.json({url: found.url})
    }else{
      status200(req, res)
    }
  })

})

module.exports = [
    {
        scope: '/endpoints',
        router: Router
    }
]
