
window.socketIdPCMap = {}
var rtcp_peer_config = {
    "iceServers": [{
        "url": "stun:stun.l.google.com:19302"
    }]
};


var mediaConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
    }
};

function startVideo(room){
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true
        })
        .then(function (stream) {
            window.localStream = stream;
            startRTC(room);
        })
        .catch(e => console.log('getUserMedia() error: ', e));
}

function startRTC(room) {
    
    
    var websocketManager = new newWebsocketManager(room);
    window.websocketManager = websocketManager;


    window.websocketManager.addEventHandler("init", function(x){
        var data = x['data'];
        window.socketId = data.socketId;
        data.peerIds.forEach( function(peerSocketId){
            setupNewPeer(peerSocketId);
            var pc = window.socketIdPCMap[peerSocketId].pc;
            pc.createOffer(function (description) {
                pc.setLocalDescription(description);
                console.log("Created offer")
                window.websocketManager.send(JSON.stringify({
                    event: "received_offer",
                    fromId: window.socketId,
                    onlyTo: peerSocketId,
                    data: {
                        value:JSON.stringify(description)
                    }
                }));
            }, function (x) { }, mediaConstraints);

            
        });
    }
    );

    window.websocketManager.addEventHandler("received_offer", function (x) {
        var socketId = x["fromId"];
        if(! window.socketIdPCMap[socketId]){
            setupNewPeer(socketId);
        }
        var rtcPeerConnection  = window.socketIdPCMap[socketId].pc;
        onPeerOfferReceived(rtcPeerConnection, JSON.parse(x["data"]["value"]), socketId);

    });

    window.websocketManager.addEventHandler("received_answer", function (x) {
        var socketId = x["fromId"];
        var remotePeerData = window.socketIdPCMap[socketId];
        if(! remotePeerData.connected){
            var res = remotePeerData.pc.setRemoteDescription(new RTCSessionDescription(x.data.value));
            res.then(function(){
            remotePeerData.connected = true;
            var pc = remotePeerData.pc;
            console.log("When connecting ", pc.remoteDescription);
            console.log("boolean cond ", remotePeerData.pc && remotePeerData.pc.remoteDescription && remotePeerData.pc.remoteDescription.type)

            for (var i = 0; i < remotePeerData.candidates.length; i = i + 1) {
                var candidate = remotePeerData.candidates[i];
                pc.addIceCandidate(candidate, function (x) {
                    console.log("Success added old ice candidate ", x)
                }
                    , function (x) {
                        console.log("Failed to add old ice candidate", x)
                    });
            }
            remotePeerData.connected = true;
            console.log("COnnected")
            });
        }

        }
    );
    
    window.websocketManager.addEventHandler("received_candidate", function (x) {
        var socketId = x["fromId"];
        var remotePeerData = window.socketIdPCMap[socketId];
        var msgData = JSON.parse(x.data.value);
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: msgData.label,
            candidate: msgData.candidate
        });
        console.log('received candidate', candidate, remotePeerData);
        if (remotePeerData.pc && remotePeerData.pc.remoteDescription && remotePeerData.pc.remoteDescription.type) {
            console.log("Remote peer connected ", remotePeerData.connected)
            pc = remotePeerData.pc;
            pc.addIceCandidate(candidate, function (x) {
                console.log("Success added ice candidate ", x)
            }
                , function (x) {
                    console.log("Faild to add ice candidate", x)
                });
            //push candidate onto queue...
        } else {
            console.log("Saving candidate for later");
            remotePeerData.candidates.push(candidate)
        }


    }
    );

    websocketManager.start();

}

function setupNewPeer(socketId){
    var pc = new RTCPeerConnection(rtcp_peer_config);
    window.localStream.getTracks().forEach( function (x) {
        console.log("Adding track ", x)
        pc.addTrack(x);
    });
    window.socketIdPCMap[socketId] = { pc: pc, connected: false, candidates: [] };

    pc.onicecandidate = function (event) {
        console.log("Got ice candidate ", event)
        var candidate = event.candidate;
        if (candidate !== null) {
            websocketManager.send(
                JSON.stringify({
                    event: "received_candidate",
                    fromId: window.socketId,
                    onlyTo: socketId,
                    data: {
                        value: JSON.stringify({
                            label: candidate.sdpMLineIndex,
                            id: candidate.sdpMid,
                            candidate: candidate.candidate
                        })
                    }
                }
                )
            );
        }
    }
    pc.onicecandidateerror = function(error){
        console.log("Error on ice candidate ", error)
    }

    pc.ontrack = function (event) {
        console.log("On add stram called", event);
        var video = $("#video-" + socketId)[0];
        if (!video) {
            var videoContainer = $("#video-container");
            var videoHtml = "<video id=\"video-" + socketId + "\"></video >";
                videoContainer.append(videoHtml);
            video = $("#video-" + socketId)[0];
        }
        if(!video.srcObject){
            video.srcObject = new MediaStream();
        }

        video.srcObject.addTrack(event.track, video.srcObject);
        video.play();
    }
}

function onPeerOfferReceived(pc, data, peerId){
    pc.setRemoteDescription(new RTCSessionDescription(data));
    pc.createAnswer(function (description) {
        console.log('sending answer');
        pc.setLocalDescription(description);
        window.websocketManager.send(JSON.stringify({
            event: 'received_answer',
            fromId: window.socketId,
            onlyTo: peerId,
            data:{
                value: description
            }
        }));
    }, function (x) {
        console.log("Error on creating answer ", pc)
    }, mediaConstraints);

}


function gotStream(peerConnection, videoElement, event) {
    if (videoElement.srcObject !== event.streams[0]) {
        videoElement.srcObject = event.streams[0];
        console.log("Got remote video stream");
    }
}

function onOfferSuccess(pc, description) {
    pc.setLocalDescription(description);
    window.websocketManager.send(description);
}

