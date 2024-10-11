import {RTCPeer} from "./RTCPeer.js";
import {render} from "sass";

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
     *
     * @param {Boolean} initior
     * @return {RTCPeer}
     */
    createPeer(initior, remoteClientId){
        const peer = new RTCPeer({
            iceServers:[
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:stun2.l.google.com:19302',
                        'stun:stun3.l.google.com:19302',
                        'stun:stun4.l.google.com:19302',
                    ],
                }
            ]
        })

        this.stream.getTracks().forEach(track=>{
            peer.addTrack(track)
        })

        this.peers.push({
            remoteClientId,
            peer
        })

        this.render()

        peer.onconnectionstatechange = () => this.render()
        peer.handleRemoteTrack(() => this.render())


        return peer
    }

    render(){
        while(this.videoList.firstChild){
            this.videoList.firstChild.remove()
        }

        for(let peerElement of this.peers){
            const video = document.createElement("video")
            video.srcObject = peerElement.peer.remoteStream
            this.videoList.appendChild(video)
            video.play()
        }
    }

    /**
     * Recupère une peer précédement créer
     * @param remoteClientId
     * @return {RTCPeer|null}
     */
    getPeer(remoteClientId){
        const target = this.peers.find(p=> p.remoteClientId == remoteClientId)
        if(!target) return null;
        return target.peer
    }
}