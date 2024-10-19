const express = require("express")
const cors = require("cors")
const roomMessager = require("./lib/RoomMessager")
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

    const ROOM_ID = req.params.id

    const initiator = Boolean(Number(req.query?.initiator))
    const CLIENT_ID = initiator ? ROOM_ID : Math.random().toString(36).substring(2, 10);

    const instanceRoomEmitter = roomMessager.getInstance()

    // broadcast un event a tous les clients connectés
    instanceRoomEmitter.emit(`message-${ROOM_ID}`,{
        type:"new",
        clientID: CLIENT_ID
    })

    // on écoute tous les messages privés
    instanceRoomEmitter.on(`message-${ROOM_ID}-${CLIENT_ID}`,(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    // on envoie l'id au client
    instanceRoomEmitter.emit(`message-${ROOM_ID}-${CLIENT_ID}`,{
        type:"connected",
        clientID: CLIENT_ID
    })

    // on écoute les messages broadcast au salon
    instanceRoomEmitter.on(`message-${ROOM_ID}`,(payload)=>{
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    res.on('close', () => {
        res.end();
    });
})

const MESSAGE_TYPES = ["iceCandidate","answer","offer"]
app.post("/room/:id",(req,res)=>{
    const ROOM_ID = req.params.id

    const body = req.body
    if(!MESSAGE_TYPES.includes(body?.type)) res.sendStatus(400)

    const instanceRoomEmitter = roomMessager.getInstance()

    if("to" in body){ // on envoie au client concerné
        instanceRoomEmitter.emit(`message-${ROOM_ID}-${body.to}`, body)
    }else{ // broadcast message a tout le salon
        instanceRoomEmitter.emit(`message-${ROOM_ID}`,body)
    }

    res.sendStatus(200)
})

app.listen(8080,()=>{
    console.log("Serveur est prêt et écoute sur le port 8080")
})
