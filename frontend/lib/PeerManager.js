import {RTCPeer} from "./RTCPeer.js";
import {StreamView} from "./StreamView.js";
//@module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
export class PeerManager{

    videoList = document.querySelector('[data-video-container]')

    /**
     * @type {{peer:RTCPeer,remoteClientId:String}[]}
     */
    peers = []
    /**
     * @type {MediaStream}
     */
    stream;
    setStream(stream){
        this.stream = stream
    }

    /**
     * Désactive l'envoie de paquet média du sender RTP selon le type spécifié
     * @param kind
     */
    disableTrack(kind="audio"){
        for(let p of this.peers){
            const {peer} = p
            const rtpSenders = peer.getSenders()
            rtpSenders.forEach((sender)=>{
                if(sender?.track?.kind == kind) peer.removeTrack(sender)
            })
        }
    }

    /**
     * Active l'envoie de paquet média du senders RTP selon le type spécifié
     * @param kind
     */
    activeTrack(kind = "audio"){
        const audioTrack = kind == "audio" ?  this.stream.getAudioTracks()[0] : this.stream.getVideoTracks()[0]

        for(let p of this.peers){
            const {peer} = p
            const rtpSenders = peer.getSenders()
            rtpSenders.forEach((sender)=>{
                if(!sender?.track) sender.replaceTrack(audioTrack)
            })
        }
    }

    /**
     * Créer une Paire RTC
     * @param {Boolean} initior
     * @return {RTCPeer}
     */
    createPeer(initior, remoteClientId){
        const peer = new RTCPeer

        this.stream.getTracks().forEach(track=>{
            peer.addTrack(track)
        })



        this.peers.push({
            remoteClientId,
            peer,
            streamView : new StreamView(peer)
        })

        return peer
    }

    disconnectAll(){
        this.peers.forEach(p=>{
            p.peer.close()
        })
    }

    /**
     * Récupère une peer précédemment créer
     * @param remoteClientId
     * @return {RTCPeer|null}
     */
    getPeer(remoteClientId){
        const target = this.peers.find(p=> p.remoteClientId == remoteClientId)
        if(!target) return null;
        return target.peer
    }

    broadcastP2P(data){
        this.peers.forEach(({peer})=>{
            const channel = peer.dataChannels.get(RTCPeer.DEFAULT_DATACHANNEL_LABEL)
            if(!channel) return;
            console.log("send data to channel", channel)
            channel.send(data)
        })
    }
}