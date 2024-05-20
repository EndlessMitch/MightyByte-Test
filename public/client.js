import { fetchHandler } from './utils.js';


document.onreadystatechange = function(){

  if(document.readyState === "complete"){

    m.route.mode = "pathname";

    const clientApp = {
      controller: new(class {

        #stateRef = {
          START: 1,
          STREAMCONNECTED: 2,
          ACK: 3,
          DONE: 4
        };

        #state;

        constructor(){
          this.#state = this.#stateRef.START;
          this.messages = [];
          this.urlId = null;
          this.source = null;
        }

        messageAction(j){
          console.log('Got', j);

          if(j.shortenedURL){
            fetchHandler({
              url: "/endpoints/ack/" + j.urlId,
              request: {
                method: "POST"
              }
            }).catch((e)=>{
              console.error(e)
            }).finally(()=>{
              this.messages.push("Got Shortened URL " + j.shortenedURL);
              this.#state = this.#stateRef.ACK;
              this.urlId = j.urlId;
              m.redraw();
            })
          }
        }

        userAction(){
          if(this.#state === this.#stateRef.START){

            this.source = new EventSource('/stream', { withCredentials: true });

            this.source.addEventListener('message', message => {
              try{
                const j = JSON.parse(message.data)
                this.messageAction(j)
              }catch(e){
                console.error(e)
              }
            });

            this.source.addEventListener("open", (e) => {

              this.messages.push("EventSource connected");

              this.#state = this.#stateRef.STREAMCONNECTED;
              m.redraw();
            }, {once: true})

          }else if(this.#state === this.#stateRef.STREAMCONNECTED){

            fetchHandler({
              url: "/endpoints/url",
              request: {
                method: "POST",
                body: JSON.stringify({url: "https://www.tinyurl.com"})
              }
            }).catch((e)=>{
              console.error(e)
            })

          }else if(this.#state === this.#stateRef.ACK){

            fetchHandler({
              url: "/endpoints/" + this.urlId,
              request: {
                method: "GET"
              }
            }).then((d)=>{
              this.messages.push("Got URL from ID " + d.data.url);
              this.#state = this.#stateRef.DONE;
            }).catch((e)=>{
              console.error(e)
            }).finally(()=>{
              m.redraw();
            })

          }
        }

        get buttonLabel(){
          if(this.#state === this.#stateRef.START){
            return "Connect"
          }
          if(this.#state === this.#stateRef.STREAMCONNECTED){
            return "POST URL"
          }
          if(this.#state === this.#stateRef.ACK){
            return "Decode Token"
          }
          return null
        }
      }),
      view: function(){

        return [
          clientApp.controller.buttonLabel ?  m("button", {onclick: clientApp.controller.userAction.bind(clientApp.controller)}, clientApp.controller.buttonLabel) : null,
          clientApp.controller.messages.map((m2)=>{
            return m("p", m2)
          })
        ]

      }
    }

    m.route(document.body, "/", {
      "/": clientApp
    });

  }

}
