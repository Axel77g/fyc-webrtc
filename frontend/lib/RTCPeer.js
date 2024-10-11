import {SignalementMessage} from "./Room.js";

/**
 * @module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
 */
export class RTCPeer extends RTCPeerConnection{

    // @module Communication - Les MediaChannel
    remoteStream = new MediaStream()

    // @module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
    constructor() {
        super({
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
        });
    }

    // @module Implémentation signalement (exemple SSE ?)
    handleIceCandidate(callback){
        this.onicecandidate = (candidateEvent) => {
            const iceMessage = new SignalementMessage()
                .setType(SignalementMessage.TYPES.ICE_CANDIDATE)
                .setContent(candidateEvent.candidate)
            callback(iceMessage)
        }
    }

    // @module Communication - Les MediaChannel
    handleRemoteTrack(callback = ()=>{}){
        this.ontrack = (trackEvent)=>{
            this.remoteStream.addTrack(trackEvent.track)
            callback(this.remoteStream)
        }
    }
}