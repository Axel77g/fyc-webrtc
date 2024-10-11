import './style.scss'
import {Room, SignalementMessage} from "./lib/Room.js";
import {PeerManager} from "./lib/PeerManager.js";

/**
 * Message handler sur le Salon
 * @param message
 */
function handleMessageOnRoom(message){
    console.log("New message", message)
    const messageHandlers = {
        /**
         * Handler lors de la connexion réussie avec le serveur de signalement
         * On stocke le client ID qui nous a été assigné
         * @param message
         */
        [SignalementMessage.TYPES.CONNECTED] : (message) => {
            room.setClientID(message.clientID)
        },

        /**
         * Handler pour gérer la connexion d'un nouveau client sur le salon
         * On créer une paire émétrice pour établir une connexion
         * @param message
         * @return {Promise<void>}
         */
        [SignalementMessage.TYPES.NEW] : async (message)=>{
            const peer = peerManager.createPeer(true, message.clientID);
            peer.createDataChannel("default") // @important il faut créer une channel
            peer.handleIceCandidate((iceMessage) => room.postMessage(iceMessage.setTo(message.clientID)))
            const offer = await peer.createOffer()
            await peer.setLocalDescription(offer)

            const responseMessage = new SignalementMessage()
                .setType(SignalementMessage.TYPES.OFFER)
                .setContent(offer)
                .setTo(message.clientID)
            room.postMessage(responseMessage)
        },

        /**
         * Handle lors de la réception d'une offre d'un des clients connecté au salon
         * On initialise notre paire et on répond à l'offre
         * @param message
         * @return {Promise<void>}
         */
        [SignalementMessage.TYPES.OFFER] : async (message) => {
            const peer = peerManager.createPeer(false, message.from)
            peer.handleIceCandidate((iceMessage) => room.postMessage(iceMessage.setTo(message.from)))
            await peer.setRemoteDescription(JSON.parse(message.content)) // @important il faut donner un objet pas une chaine il faut un objet RTCSessionDescriptionInit
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)

            const responseMessage = new SignalementMessage()
                .setType(SignalementMessage.TYPES.ANSWER)
                .setContent(answer)
                .setTo(message.from)
            room.postMessage(responseMessage)
        },

        /**
         * Handle lors de la reception d'une answer
         * On enregistre la description distante
         * @param message
         * @return {Promise<void>}
         */
        [SignalementMessage.TYPES.ANSWER] : async (message) => {
            const peer = peerManager.getPeer(message.from)
            await peer.setRemoteDescription(JSON.parse(message.content))
            console.log(peer)
        },

        /**
         * Reception d'un ice candidate
         * On l'ajoute a notre paire
         * @param message
         * @return {Promise<void>}
         */
        [SignalementMessage.TYPES.ICE_CANDIDATE] : async (message) => {
            const peer =  peerManager.getPeer(message.from)
            await peer.addIceCandidate(JSON.parse(message.content))
        }
    }
    if(!(message.type in messageHandlers)) return;
    messageHandlers[message.type](message)
}

const peerManager = new PeerManager
const room = new Room(handleMessageOnRoom)

navigator.mediaDevices.getUserMedia({
    video:true
}).then((stream)=>{
    peerManager.setStream(stream)
})


