$(document).ready(function(){

    //init();
    $("#chat-log").hide();
    setupChat();

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
