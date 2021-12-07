

function newWebsocketManager(room){

    var websocketManger = {}
    websocketManger.eventHandlers = {};

    websocketManger.addEventHandler = function(ev, handler){
        if (!websocketManger.eventHandlers[ev]){
            websocketManger.eventHandlers[ev] = [handler];
        }else{
            websocketManger.eventHandlers[ev].push(handler);
        }
    }


    websocketManger.send = function(x){
        console.log("Websocket Sending ", x);
        websocketManger.websocket.send(x);
    }
   
    websocketManger.start = function(){
        var hostname = document.location.hostname;
        websocketManger.websocket = new WebSocket("wss://"+hostname+":8080/api/rtc_transport?room=" + room);
        websocketManger.websocket.onmessage = function (ev) {
            var message = ev.data;
            var msg = JSON.parse(message);
            console.log("Got websocket message ", message)
            var eventName = msg['event'];
            if (websocketManger.eventHandlers[eventName]) {
                websocketManger.eventHandlers[eventName].forEach(function (x) {
                    x(msg);
                })
            }
        };


    }

    return websocketManger; 
}

