import {SignalementMessage} from "./Room.js";
import {RTCPeer} from "./RTCPeer.js";

export class SignalementHandler{

    /** @type {PeerManager} */
    peerManager;
    /** @type {Room} */
    room;

    handler = null
    constructor(type, peerManager,room) {
        this.peerManager = peerManager
        this.room = room
        if(type in this) this.handler = this[type];
    }

    execute(...params){
        if(!this.handler) return;
        this.handler(...params)
    }


    /**
     * Handler lors de la connexion réussie avec le serveur de signalement
     * On stocke le client ID qui nous a été assigné
     * @param message
     */
    [SignalementMessage.TYPES.CONNECTED](message) {
        this.room.setClientID(message.clientID)
    }

    /**
     * Handler pour gérer la connexion d'un nouveau client sur le salon
     * On créer une paire émétrice pour établir une connexion
     * @param message
     * @return {Promise<void>}
     */
    async [SignalementMessage.TYPES.NEW](message){
        const peer = this.peerManager.createPeer(true, message.clientID);
        peer.createDataChannel(RTCPeer.DEFAULT_DATACHANNEL_LABEL) // @important il faut créer une channel
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)

        const responseMessage = new SignalementMessage()
            .setType(SignalementMessage.TYPES.OFFER)
            .setContent(offer)
            .setTo(message.clientID)
        await this.room.postMessage(responseMessage)
        peer.handleIceCandidate((iceMessage) => this.room.postMessage(iceMessage.setTo(message.clientID)))
    }

    /**
     * Handle lors de la réception d'une offre d'un des clients connecté au salon
     * On initialise notre paire et on répond à l'offre
     * @param message
     * @return {Promise<void>}
     */
    async [SignalementMessage.TYPES.OFFER](message){
        const peer = this.peerManager.createPeer(false, message.from)
        await peer.setRemoteDescription(JSON.parse(message.content)) // @important il faut donner un objet pas une chaine il faut un objet RTCSessionDescriptionInit
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)

        const responseMessage = new SignalementMessage()
            .setType(SignalementMessage.TYPES.ANSWER)
            .setContent(answer)
            .setTo(message.from)
        await this.room.postMessage(responseMessage)
        peer.handleIceCandidate((iceMessage) => this.room.postMessage(iceMessage.setTo(message.from)))

    }

    /**
     * Handle lors de la reception d'une answer
     * On enregistre la description distante
     * @param message
     * @return {Promise<void>}
     */
    async [SignalementMessage.TYPES.ANSWER] (message) {
        const peer = this.peerManager.getPeer(message.from)
        await peer.setRemoteDescription(JSON.parse(message.content))
    }

    /**
     * Reception d'un ice candidate
     * On l'ajoute a notre paire
     * @param message
     * @return {Promise<void>}
     */
    async [SignalementMessage.TYPES.ICE_CANDIDATE] (message) {
        const peer =  this.peerManager.getPeer(message.from)
        await peer.addIceCandidate(JSON.parse(message.content))
    }
}