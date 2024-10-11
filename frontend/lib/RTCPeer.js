import {SignalementMessage} from "./Room.js";

export class RTCPeer extends RTCPeerConnection{

    remoteStream = new MediaStream()

    constructor(...args) {
        super(...args);
    }



    handleIceCandidate(callback){
        this.onicecandidate = (candidateEvent) => {
            console.log("candidate")
            const iceMessage = new SignalementMessage()
                .setType(SignalementMessage.TYPES.ICE_CANDIDATE)
                .setContent(candidateEvent.candidate)
            callback(iceMessage)
        }
    }

    handleRemoteTrack(callback = ()=>{}){
        this.ontrack = (trackEvent)=>{
            this.remoteStream.addTrack(trackEvent.track)
            callback(this.remoteStream)
        }
    }
}