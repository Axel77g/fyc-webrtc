import axios from "axios";

//@module Implémentation signalement SSE et ICE
export class Room {
    apiURL = import.meta.env.VITE_API_URL + '/room'
    roomID= Math.random().toString(36).substring(2, 10);
    clientID = null;
    /**
     * @type {?EventSource}
     */
    eventSource = null;
    onMessage = ()=>{}

    roomForm = document.querySelector('[data-room-form]')
    roomIdSpan = document.querySelector('[data-room-id]')
    clientIdSpan = document.querySelector('[data-client-id]')

    //@module Implémentation signalement SSE et ICE
    constructor(onMessage) {
        this.roomForm.onsubmit = this.handleJoin.bind(this)
        this.onMessage = onMessage
        this.roomIdSpan.innerHTML = this.roomID
        this.join(1)
    }

    //@module Implémentation signalement SSE et ICE
    handleJoin(event){
        event.preventDefault()
        const payload = new FormData(this.roomForm)
        this.roomID = payload.get('roomId')
        this.roomIdSpan.innerHTML = this.roomID
        this.join()
    }

    //@module Implémentation signalement SSE et ICE
    join(initiator = 0) {
        this.eventSource?.close()
        this.eventSource = new EventSource(this.apiURL + "/" + this.roomID + "?initiator=" + initiator);
        this.eventSource.onmessage = (event) => {
            this.onMessage(JSON.parse(event.data))
        };
    }

    /**
     * @module Implémentation signalement SSE et ICE
     * @param {SignalementMessage} payload
     * @return {Promise<axios.AxiosResponse<any>>}
     */
    async postMessage(message){
        if(!this.roomID || !this.clientID) return;
        message.setFrom(this.clientID)
        return await axios.post(this.apiURL + "/" + this.roomID, message)
    }

    //@module Implémentation signalement SSE et ICE
    setClientID(clientID){
        this.clientID = clientID
        this.clientIdSpan.innerHTML = clientID
    }
}

//@module Implémentation signalement SSE et ICE
export class SignalementMessage {
    static TYPES = {
        OFFER : "offer",
        ANSWER : "answer",
        ICE_CANDIDATE : "iceCandidate",
        NEW: "new",
        CONNECTED : "connected"
    }
    constructor() {
        this.type = SignalementMessage.TYPES.OFFER
        this.content = null
        this.to = null
        this.from = null
    }

    setType(type){
        this.type = type
        return this
    }
    setContent(content){
        this.content = JSON.stringify(content)
        return this
    }

    setTo(to){
        this.to = to
        return this
    }
    setFrom(from) {
        this.from = from
        return this
    }
}