const express = require("express")
const cors = require("cors")
const RoomEventEmitter = require("./RoomEventEmitter")
const app = express()

app.use(express.json())
app.use(cors({
    origin:"*"
}))

app.get("/room/:id",(req,res)=>{
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const initiator = Boolean(Number(req.query?.initiator))
    const uniqueIdClient = initiator ? req.params.id : Math.random().toString(36).substring(2, 10);

    const instanceRoomEmitter = RoomEventEmitter.getInstance()

    // broadcast un event a tous les clients connectés
    instanceRoomEmitter.emit(`message-${req.params.id}`,{
        type:"new",
        clientID: uniqueIdClient
    })

    // on écoute tous les messages privés
    instanceRoomEmitter.on(`message-${req.params.id}-${uniqueIdClient}`,(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    // on envoie l'id au client
    instanceRoomEmitter.emit(`message-${req.params.id}-${uniqueIdClient}`,{
        type:"connected",
        clientID: uniqueIdClient
    })

    // on écoute les messages broadcast au salon
    instanceRoomEmitter.on(`message-${req.params.id}`,(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
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
    if("to" in body){
        // on envoie au client concerné
        instanceRoomEmitter.emit(`message-${req.params.id}-${body.to}`, body)
    }else{
        // broadcast message
        instanceRoomEmitter.emit(`message-${req.params.id}`,body)
    }
    res.sendStatus(200)
})

app.listen(8080,()=>{
    console.log("Serveur est prêt et écoute sur le port 8080")
})
