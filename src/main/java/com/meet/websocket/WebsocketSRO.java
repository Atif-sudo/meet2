package com.meet.websocket;

import org.springframework.web.socket.WebSocketMessage;

import java.util.HashMap;
import java.util.Map;

public class WebsocketSRO  {

    private String event;
    private String fromId;


    public WebsocketSRO(String event) {
        this.event = event;
        this.data = new HashMap<>();
    }

    public String getFromId() {
        return fromId;
    }

    public void setFromId(String fromId) {
        this.fromId = fromId;
    }

    public String getOnlyTo() {
        return onlyTo;
    }

    public void setOnlyTo(String onlyTo) {
        this.onlyTo = onlyTo;
    }

    private String onlyTo;
    private Map<String, Object> data;


    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
