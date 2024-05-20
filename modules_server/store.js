const DELAY = 150,
MemoryStore = class {
  #store;

  constructor(){
    this.#store = {};
    return this;
  }

  setItem(key, value){
    globalLogger.info("Setting item", key)
    return new Promise((resolve)=>{
      setTimeout(()=>{
        this.#store[key] = value;
        resolve(this.#store[key])
      }, DELAY)
    })
  }

  getItem(key){
    globalLogger.info("Getting item", key)
    return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve(this.#store[key])
      }, DELAY)
    })
  }

  removeItem(key){
    globalLogger.info("Removing item", key)
    return new Promise((resolve)=>{
      setTimeout(()=>{
        delete this.#store[key];
        resolve()
      }, DELAY)
    })
  }

  updateItem(key, valueFunction){
    return this.getItem(key).then((value)=>{
      return this.setItem(key, valueFunction(value))
    });
  }

  getUrlByUrl(url){
    return this.getItem('urls').then((u)=>{
      return (u || []).find((p2)=>{
        return p2.url === url
      })
    })
  }

  getUrlById(id){
    return this.getItem('urls').then((u)=>{
      return (u || []).find((p2)=>{
        return p2.id === id
      })
    })
  }
},

app = new MemoryStore();

app.setItem('urls', []);

module.exports = app;
