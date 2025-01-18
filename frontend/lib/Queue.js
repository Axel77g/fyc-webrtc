export class Queue{
    /**
     * @type {Array<Function>}
     */
    queue = []
    running = false

    enqueue(callback){
        this.queue.push(callback)
        if(this.running){
            this.run()
        }
    }

    dequeue(){
        return this.queue.shift()
    }

    run(){
        const callback = this.dequeue()
        if(callback){
            callback()
            this.run()
        }
    }

}