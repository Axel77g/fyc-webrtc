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
        if(!(event in this.listener)) return;
        let callbacks = this.listener[event]
        callbacks.forEach(callback=>{
            callback(payload)
        })
    }

    on(event,callback){
        if(!(event in this.listener)) this.listener[event] = []
        this.listener[event].push(callback)
        return callback
    }

    off(event,callback){
        if(!(event in this.listener)) return;
        let callbacks = this.listener[event]
        let index = callbacks.indexOf(callback)
        if(index !== -1) callbacks.splice(index,1)
        if(callbacks.length === 0) delete this.listener[event]
    }
}