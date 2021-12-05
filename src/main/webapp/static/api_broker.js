

function newAPIBroker(room) {

    var apiBroker = {}
    apiBroker.eventHandlers = {};

    apiBroker.addEventHandler = function (ev, handler) {
        if (!apiBroker.eventHandlers[ev]) {
            apiBroker.eventHandlers[ev] = [handler];
        } else {
            apiBroker.eventHandlers[ev].push(handler);
        }
    }


    apiBroker.send = function (x) {
        console.log("Websocket Sending ", x);
        $.post({
            url:"/api/events", 
            data:x,
            success:function(resp){
             console.log("Got response ", resp)
            
            },
            contentType: "application/json",
            dataType: 'json'

        }
        )
    }

    function handleEvent(msg){
        var eventName = msg['event'];
        if (apiBroker.eventHandlers[eventName]) {
            apiBroker.eventHandlers[eventName].forEach(function (x) {
                x(msg);
            })
        }

    }

    apiBroker.start = function () {
        $.get("/api/init?roomId="+room, function (resp) {
            var response = JSON.parse(resp);
            console.log("Got response ", response)
            handleEvent(response)

            var intervalId = setInterval(function () {
                $.get("/api/events?userId=" + encodeURIComponent(window.socketId), function (resp2) {
                    
                    var response2 = JSON.parse(resp2);
                    if(response2.length >0){
                        console.log("Got response ", response2)

                    }
                    response2.forEach(handleEvent);
                })
            }, 10000)

            window.intervalId = intervalId;
        })

        

    }

    return apiBroker;
}

