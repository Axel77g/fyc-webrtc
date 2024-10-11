export class RoomEventEmitter{
    static instance = null
    listener = []
    static getInstance(){
        if(!RoomObserver.instance){
            RoomObserver.instance = new RoomObserver
        }
        return RoomObserver.instance
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
    }
}