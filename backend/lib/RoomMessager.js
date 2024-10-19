module.exports = class RoomMessager{
    static instance = null
    listener = []
    id= Math.random().toString(36).substring(2, 10)
    static getInstance(){
        if(!RoomMessager.instance){
            RoomMessager.instance = new RoomMessager()
            console.log("RoomMessager instance created", RoomMessager.instance.id)
        }
        return RoomMessager.instance
    }

    emit(event, payload){
        console.log("Emit message on ", event)
        if(!(event in this.listener)) return;
        let callbacks = this.listener[event]
        console.log("Subscribed counts", callbacks.length)
        callbacks.forEach(callback=>{
            callback(payload)
        })
    }

    on(event,callback){
        console.log("Subscribe to ", event)
        if(!(event in this.listener)) this.listener[event] = []
        this.listener[event].push(callback)
    }
}