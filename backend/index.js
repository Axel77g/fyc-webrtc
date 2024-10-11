const express = require("express")
const app = express()
const {RoomEventEmitter} = require("./RoomEventEmitter")

app.use(express.json())

app.get("/room/:id",(req,res)=>{
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let instanceRoomEmitter = RoomEventEmitter.getInstance()

    instanceRoomEmitter.on("message",(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\\n\\n`)
    })

    res.on('close', () => {
        res.end();
    });
})

app.post("/room/:id",(req,res)=>{
    const body = req.body

})

app.listen(8080,()=>{
    console.log("Serveur est prêt et écoute sur le port 8080")
})
