$(document).ready(function(){

    //init();
    $("#chat-log").hide();
    setupChat();
    window.$ = $;

});

function setupChat(){

    $("#chat-submit").on('click', function(){
        var username = $("#chat-username").val();
        var room = $("#chat-room").val();
        startWebsocket(username, room);
        $("#chat-log").show();
        $("#chat-join").hide();
        startVideo(room);
    })

    $("#chat-send").on('click', function(){
        var message = $("#chat-input").val();
        var username = $("#chat-username").val();
        var jsonMsg = {username:username, message:message};
        //window.websocket.send(jsonMsg);
    });
}

function startWebsocket(username, room){
    
}

function initiaizeVideo(roomId){
    startVideo(roomId);

    $(".navbar").hide();
    $(".container1").hide();
    $("#meeting").show();
}

function createRoom(){
    $.post({
        url:"/api/new_room",
        success:function(resp){
            console.log("Got response ", resp)
            var roomId = resp.room_id;
            $('#meeting-id').val(roomId);
            window.roomId = roomId;
            initiaizeVideo(roomId);
        },
        contentType: "application/json",
        dataType: 'json'

    });
}
$( document ).ready(function() {
    document.getElementById('chat-container').style.display="none";

    document.getElementById('send-msg').addEventListener('click',function(){
        let msg = document.getElementById('msg').value;


        let html = '<p class="self-msg"><span>'+msg+'</span></p>';
        document.getElementById('chat').innerHTML += html;
        scrollBottom();
        document.getElementById('msg').value="";

    });

    $("#join-room").on('click', function (ev){
        var roomId = $('#room-id').val();
        console.log("Room id to join is ", roomId);
        initiaizeVideo(roomId);
    });

document.getElementById('open-chat').onclick = function(e){
    let elm = document.getElementById('chat-container');
    if(elm.style.display == "none"){
        elm.style.display="block";
        document.getElementById('open-chat').children[0].classList.remove('fas','fa-comment-alt');
        document.getElementById('open-chat').children[0].classList.add('fas','fa-times');
    }else{
        elm.style.display="none";
        document.getElementById('open-chat').children[0].classList.remove('fas','fa-times');
        document.getElementById('open-chat').children[0].classList.add('fas','fa-comment-alt');
    }


};


    document.getElementById('mute-audio').addEventListener('click',function(){
        if(localStream.getAudioTracks()[0]['enabled']){
            localStream.getAudioTracks()[0]['enabled'] =false;
            let elm = document.getElementById('mute-audio').children[0];
            elm.classList.remove('fa-microphone');
            elm.classList.add('fa-microphone-slash');
        }else{
            let elm = document.getElementById('mute-audio').children[0];
            localStream.getAudioTracks()[0]['enabled'] =true;
            elm.classList.remove('fa-microphone-slash');
            elm.classList.add('fa-microphone');
        }
    });
    document.getElementById('mute-video').addEventListener('click',function(){
        if(localStream.getVideoTracks()[0]['enabled']){
            localStream.getVideoTracks()[0]['enabled'] =false;
            let elm = document.getElementById('mute-video').children[0];
            elm.classList.remove('fa-video');
            elm.classList.add('fa-video-slash');

        }else{
            localStream.getVideoTracks()[0]['enabled'] =true;
            let elm = document.getElementById('mute-video').children[0];
            elm.classList.remove('fa-video-slash');
            elm.classList.add('fa-video');
        }
        selfStream.getVideoTracks()[0]['enabled'] =!(selfStream.getVideoTracks()[0]['enabled']);
    });
    document.querySelector('.copy-meeting-id').children[1].addEventListener('click',function(){
        let text = document.getElementById("meeting-id");
        text.select();
        text.setSelectionRange(0,999999);
        document.execCommand('copy');
        document.getElementById('coppied-msg').innerText="Meeting id copied";
        setTimeout(function(){
            document.getElementById('coppied-msg').innerText="";
        },3000);
    })
    function scrollBottom(){
        let elm = document.getElementById('chat');
        if((elm.scrollTop + elm.clientHeight) != elm.scrollHeight){
            elm.scrollTop = elm.scrollHeight;
        }
    }
    let displayMedia = navigator.mediaDevices.getDisplayMedia;
    if(displayMedia){
        let isScreenShareOn = false;
        let screenVideo;
        document.getElementById('share-screen').addEventListener('click',function(){
            if(!isScreenShareOn){
                isScreenShareOn = true;
                document.getElementById('share-screen').children[0].classList.remove('fas','fa-desktop');
                document.getElementById('share-screen').children[0].classList.add('fas','fa-times');

                navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor:"always",
                    },
                    audio: true,
                }).then((stream)=>{
                    screenVideo = stream.getVideoTracks()[0];
                    screenVideo.onended = function(){
                        stopScreenShare();
                    }

                }).catch((err)=>{
                    console.log(err);
                });
            }else{
                isScreenShareOn = false;
                stopScreenShare();
                document.getElementById('share-screen').children[0].classList.remove('fas','fa-times');
                document.getElementById('share-screen').children[0].classList.add('fas','fa-desktop');
            }

        });
    }else{
        //hide screenshare button
        document.getElementById('share-screen').remove();
    }
    function stopScreenShare() {
        let videoTrack = localStream.getVideoTracks()[0];
    }



});

function deleteRoom(){

}