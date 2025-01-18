import {RTCPeer} from "./RTCPeer.js";

export class StreamView extends EventTarget {
    /** @type {RTCPeer} */
    peer
    /** @type {HTMLElement} */
    videoList= document.querySelector('[data-video-container]')
    /** @type {HTMLElement} */
    container = null;
    /** @type {MediaStream} */
    selfMediaStream;

    videoActive = true;
    audioActive = true;
    setVideoActive(value){
        this.videoActive = value
        this.dispatchEvent(new CustomEvent("videoChange",{
            detail:value
        }));
        this.render()

    }

    setAudioActive(value){
        this.audioActive = value
        this.dispatchEvent(new CustomEvent("audioChange",{
            detail:value
        }));
        this.render()
    }


    constructor(peer, selfMediaStream = null) {
        super();
        this.peer = peer
        if(peer){
            this.peer.addEventListener("track", () => this.render)
            this.peer.addEventListener("connectionstatechange", () => this.render())
            this.peer.addEventListener(`message:${RTCPeer.DEFAULT_DATACHANNEL_LABEL}`,(event)=>{
                const message = event.detail
                if(message.startsWith("audio=")){
                    this.setAudioActive(message.split("=")[1] == "true")
                }else if(message.startsWith("video=")){
                    this.setVideoActive(message.split("=")[1] == "true")
                }
            })

            this.peer.addEventListener("connectionstatechange",()=>{
                if(this.peer.connectionState === "disconnected"){
                    this.render()
                }
            })
        }else if(selfMediaStream){
            this.selfStream = selfMediaStream
        }else throw new Error("Please give a peer or a MediaStream to the StreamView")
    }

    hasStreamRunning(){
        if(this.selfStream) return true;
        if(!this.peer) return false
        if(this.peer.connectionState !== "connected") return false
        if(this.peer.remoteStream.getTracks().length == 0) return false
        return true
    }


    get mediaStream(){
        return this.selfStream || this.peer.remoteStream
    }
    render(){
        let old = this.container
        if(old) {
            this.container = null;
        }

        if(!this.hasStreamRunning()) {
            if(old) this.videoList.removeChild(old)
            return this
        }

        this.container = document.createElement("div")
        this.container.classList.add("stream-container")
        if(this.selfStream){
            this.container.setAttribute('self', true)

            const toggleVideoBtn = new StreamControlButton(this.videoActive, 'videocam','videocam-off')
            const toggleAudioBtn = new StreamControlButton(this.audioActive,"mic",'mic-off')

            toggleVideoBtn.addEventListener("change",()=>{
                this.setVideoActive(toggleVideoBtn.value)
            })
            toggleAudioBtn.addEventListener("change",()=>{
                this.setAudioActive(toggleAudioBtn.value)
            })

            if(this.mediaStream.getVideoTracks().length !== 0) this.container.appendChild(toggleVideoBtn);
            if(this.mediaStream.getAudioTracks().length !== 0) this.container.appendChild(toggleAudioBtn);
        }


        if(this.videoActive && this.mediaStream.getVideoTracks().length !== 0){
            const video = document.createElement("video")
            video.srcObject = this.mediaStream
            video.volume = 0;
            video.autoplay = true
            this.container.appendChild(video)
        }else{
            const placeholder = document.createElement("div")
                placeholder.classList.add("video-placeholder")
               if(this.videoActive)  placeholder.innerText = "Aucun flux vidéo disponible"
            this.container.appendChild(placeholder)
        }

        if(this.audioActive){
            const audio = document.createElement("audio")
            //audio.setAttribute("controls", "controls")
            audio.srcObject = this.mediaStream
            audio.volume = 1;
            audio.autoplay = true
            this.container.appendChild(audio)
        }else{
           const icon = document.createElement("ion-icon")
            icon.setAttribute("name","mic-off")
            icon.classList.add("audio-off")
            this.container.appendChild(icon)
        }
        //replace old container if exist
        if(old) {
            this.videoList.replaceChild(this.container, old)
        }
        else
        {
            this.videoList.appendChild(this.container)
        }
        return this
    }
}

export class StreamControlButton extends HTMLElement{
    value = true
    setValue(v){
        this.value = v
        this.dispatchEvent(new Event("change",{
            data:v
        }))
    }

    constructor(value,activeIcon,disableIcon){
        super();
        this.value = value
        this.activeIcon = activeIcon
        this.disableIcon = disableIcon
        this.addEventListener("click",()=>{
            this.setValue(!this.value)
        })
        this.render()
    }

    render(){
        let childrens = this.children
        if(childrens.length > 0){
            for(let i = 0; i < childrens.length; i++){
                childrens[i].remove()
            }
        }
        const icon = document.createElement('ion-icon')
        icon.setAttribute("name", this.value ? this.activeIcon : this.disableIcon)
        this.appendChild(icon)
        this.setAttribute('data-active', this.value)
        // this.innerText = this.value ? this.activeName : this.disableName
    }

}

customElements.define("stream-control-btn", StreamControlButton);