var socket = new WebSocket('ws://' + '192.168.43.166:8080' + room);//

var pendingCandidates = [];



socket.onmessage = function(message) {
	var msg = JSON.parse(message.data);
    console.log("Got message ", message)
	switch (msg.type) {
	case 'assigned_id':
		socket.id = msg.id;
		break;
	case 'received_offer':
		console.log('received offer', msg.data);
		pc.setRemoteDescription(new RTCSessionDescription(msg.data));
		pc.createAnswer(function(description) {
			console.log('sending answer');
			pc.setLocalDescription(description);
			socket.send(JSON.stringify({
				type : 'received_answer',
				data : description
			}));
		}, function(x){
		    console.log("Error on creating answer ", x)
		}, mediaConstraints);
		break;
	case 'received_answer':
		console.log('received answer');
		if (!connected) {
			pc.setRemoteDescription(new RTCSessionDescription(msg.data));
			connected = true;
			for(var i=0;i<pendingCandidates.length;i=i+1){
			                var candidate = pendingCandidates[i];
			                pc.addIceCandidate(candidate, function(x){
                            console.log("Success added ice candidate ", x)}
                            , function(x){
                                console.log("Faild to add ice candidate", x)
                            });
                           }
                pendingCandidates = [];
			}
		break;
	case 'received_candidate':
	    console.log("Got data, ", msg.data)
	    var msgData = msg.data
		var candidate = new RTCIceCandidate({
			sdpMLineIndex : msgData.label,
			candidate : msgData.candidate
		});
				console.log('received candidate', candidate);
        if(pc && pc.remoteDescription && pc.remoteDescription.type){
            pc.addIceCandidate(candidate, function(x){
            console.log("Success added ice candidate ", x)}
            , function(x){
                console.log("Faild to add ice candidate", x)
            });
            //push candidate onto queue...
        }else{
            pendingCandidates.push(candidate)
        }
		break;
	case 'connection_closed':
		console.log('peer ' + msg.peer + ' closed connection');
		break;
	}
};

var pc;
var configuration = {
	"iceServers" : [ {
		"url" : "stun:stun.l.google.com:19302"
	} ]
};
var stream;
var pc = new RTCPeerConnection(configuration);
var connected = false;
var mediaConstraints = {
	'mandatory' : {
		'OfferToReceiveAudio' : true,
		'OfferToReceiveVideo' : true
	}
};

pc.onicecandidate = function(e) {
    console.log("Got ice candidate", e)
	if (e.candidate) {
		socket.send(JSON.stringify({
			type : 'received_candidate',
			data : {
				label : e.candidate.sdpMLineIndex,
				id : e.candidate.sdpMid,
				candidate : e.candidate.candidate
			}
		}));
	}
};

pc.onaddstream = function(e) {
//    var streams = pc.getRemoteStreams();
//    for (var stream in streams) {
//        console.log("Remote streams: " + stream.id);
//      }
	console.log('start remote video stream');
	vid2.srcObject = e.stream;
	vid2.play();
};

function broadcast() {
	// gets local video stream and renders to vid1
	navigator.getUserMedia({
		audio : true,
		video : true
	}, function(s) {
		stream = s;
		pc.addStream(s);
                
		vid1.srcObject = s;
		vid1.play();
		// initCall is set in views/index and is based on if there is another
		// person in the room to connect to
                
		if (initCall){
		console.log("Init call true, adding stream")
                    start();
                    //pc.onaddstream(s);
                }
	}, function(error) {
		try {
			console.error(error);
		} catch (e) {
		}
	});
}

function start() {
    
//    		pc.createAnswer(function(description) {
//			console.log('sending answer');
//			pc.setLocalDescription(description);
//			socket.send(JSON.stringify({
//				type : 'received_answer',
//				data : description
//			}));
//		}, null, mediaConstraints);

	pc.createOffer(function(description) {
		pc.setLocalDescription(description);
		console.log("Crated offer")
		socket.send(JSON.stringify({
			type : 'received_offer',
			data : description
		}));
	}, function(x){}, mediaConstraints);
     
}

window.onload = function() {
	broadcast();
};

window.onbeforeunload = function() {
	socket.send(JSON.stringify({
		type : 'close'
	}));
	pc.close();
	pc = null;
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}