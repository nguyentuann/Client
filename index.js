const btnStart = document.querySelector('.btn-start');
const btnEnd = document.querySelector('.btn-end');

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

let peerConnection;
let localStream;

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(event.candidate)
      electronAPI.socketEmit('ice-candidate', event.candidate);
    }
  }

  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }
}

btnStart.addEventListener('click', async () => {
  document.getElementById("start").style.display = "none";
  document.getElementById("stop").style.display = "block";

  // Web RTC
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { mandatory: { chromeMediaSource: 'desktop' } }
    });
    console.log(typeof localStream)

    createPeerConnection();

    // tao va gui offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    electronAPI.socketEmit('offer', offer);
    console.log(offer)
  } catch (error) {
    console.log(error);
  }
});


// socket.on('answer', async (answer) => {
electronAPI.socketOn('answer', async (answer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (err) {
    console.log(err);
  }
})

// socket.on('ice-candidate', async (candidate) => {
electronAPI.socketOn('ice-candidate', async (candidate) => {
  try {
    console.log("Receive ice-candidate: " + candidate);
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.log(err);
  }
})


btnEnd.addEventListener('click', () => {
  document.getElementById("stop").style.display = "none";
  document.getElementById("start").style.display = "block";
})


