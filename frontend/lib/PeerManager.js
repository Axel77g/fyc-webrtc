import {RTCPeer} from "./RTCPeer.js";
import {render} from "sass";

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
     * Créer une Paire RTC
     * @param {Boolean} initior
     * @return {RTCPeer}
     */
    createPeer(initior, remoteClientId){
        const peer = new RTCPeer()

        this.stream.getTracks().forEach(track=>{
            peer.addTrack(track)
        })

        this.peers.push({
            remoteClientId,
            peer
        })

        this.render()

        //@module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
        peer.onconnectionstatechange = () => this.render()
        //@module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
        peer.handleRemoteTrack(() => this.render())

        return peer
    }

    /**
     * //@module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
     * Affiche les videos des paires qui on un stream en cours
     */
    render(){
        while(this.videoList.firstChild){
            this.videoList.firstChild.remove()
        }

        // @module Communication - Les MediaChannel
        for(let peerElement of this.peers){
            if(peerElement.peer.connectionState !== "connected") continue
            if(peerElement.peer.remoteStream.getTracks().length == 0) continue
            const video = document.createElement("video")
            video.srcObject = peerElement.peer.remoteStream
            this.videoList.appendChild(video)
            video.play()
        }
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
}