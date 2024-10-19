import {SignalementMessage} from "./Room.js";

/**
 * @module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
 */
export class RTCPeer extends RTCPeerConnection{
    static DEFAULT_DATACHANNEL_LABEL = "default"

    // @module Communication - Les MediaChannel
    remoteStream = new MediaStream()
    /** @type {Map<String, RTCDataChannel>} */
    dataChannels = new Map
    //@module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
    // @module Votre première peer WebRTC (events, et state de l’objet PeerConnectection)
    constructor(clientID) {
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

        this.handleDataChanel()  // @module Communication DataChannel
        this.handleRemoteTrack() // @module Communication - Les MediaChannel
    }
    // @module Implémentation signalement (exemple SSE ?)
    handleIceCandidate(callback){
        this.addEventListener("icecandidate",(candidateEvent) => {
            if(candidateEvent.candidate === null) return
            const iceMessage = new SignalementMessage()
                .setType(SignalementMessage.TYPES.ICE_CANDIDATE)
                .setContent(candidateEvent.candidate)
            callback(iceMessage)
        })
    }

    // @module Communication - Les MediaChannel
    handleRemoteTrack(){
        this.addEventListener("track",(trackEvent)=>{
            this.remoteStream.addTrack(trackEvent.track)
        })
    }

    // @module Communication DataChannels
    handleDataChanel(){
        this.addEventListener('datachannel',(event)=>{
            this.dataChannels.set(event.channel.label, event.channel)
            this.listenForMessage(event.channel)
        })
    }

    // @module Communication DataChannels
    createDataChannel(label, dataChannelDict) {
        const channel = super.createDataChannel(label,dataChannelDict)
        channel.addEventListener("open", ()=>{
            this.dataChannels.set(label,channel)
            this.listenForMessage(channel)
        })
        channel.addEventListener("close", ()=>{
            this.dataChannels.delete(label)
        })
        return channel
    }

    // @module Communication DataChannels
    listenForMessage(channel){
        channel.addEventListener('message',(event)=>{
            this.dispatchEvent(new CustomEvent(`message:${channel.label}`,{
                detail: event.data
            }))
        })
    }
}