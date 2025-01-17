import './style.scss'
import {Room, SignalementMessage} from "./lib/Room.js";
import {PeerManager} from "./lib/PeerManager.js";
import {SignalementHandler} from "./lib/SignalementHandler.js";
import {StreamView} from "./lib/StreamView.js";


function onMessage(m){
    return new SignalementHandler(m?.type,peerManager,room)
        .execute(m)
}

const peerManager = new PeerManager
const room = new Room(onMessage)

navigator.mediaDevices.getUserMedia({
    video:false,
    audio:true
}).then((stream)=>{
    peerManager.setStream(stream)

    let streamView = new StreamView(null,stream)
    streamView.render()

    streamView.addEventListener("audioChange",({detail : value})=>{
        if(value){
            peerManager.activeTrack("audio")
        }else{
            peerManager.disableTrack("audio")
        }
        peerManager.broadcastP2P(`audio=${value}`)
    })

    streamView.addEventListener("videoChange",({detail : value})=>{
        if(value){
            peerManager.activeTrack("video")
        }else{
            peerManager.disableTrack("video")
        }
        peerManager.broadcastP2P(`video=${value}`)
    })
})


