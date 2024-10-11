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

    const instanceRoomEmitter = RoomEventEmitter.getInstance()

    instanceRoomEmitter.on("message",(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\\n\\n`)
    })

    res.on('close', () => {
        res.end();
    });
})

const MESSAGE_TYPES = ["iceCandidate","answer","offer"]
app.post("/room/:id",(req,res)=>{
    const body = req.body
    if(!MESSAGE_TYPES.includes(body?.type)) res.sendStatus(400)
    const instanceRoomEmitter = RoomEventEmitter.getInstance()
    instanceRoomEmitter.emit("message",body)
    res.sendStatus(200)
})

app.listen(8080,()=>{
    console.log("Serveur est prêt et écoute sur le port 8080")
})
