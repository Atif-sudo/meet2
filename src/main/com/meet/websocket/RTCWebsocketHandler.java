package com.meet.websocket;

import com.google.gson.Gson;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// #TODO implement synchronization

@Component
public class RTCWebsocketHandler implements WebSocketHandler {

    private final Map<String, List<WebSocketSession>> sessionMap;
    private final Map<String, String> sessionIdRoomMap;
    private final Map<String, WebSocketSession> sessionHashMap;
    private static Object lock;
    private static Gson gson = new Gson();

    public RTCWebsocketHandler() {
        sessionMap = new HashMap<>();
        sessionIdRoomMap = new HashMap<>();
        sessionHashMap = new HashMap<>();
        if (lock == null) {
            lock = new Object();
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession webSocketSession) throws Exception {
        String query = webSocketSession.getUri().getQuery();
        if (query == null) {
            System.out.println("No query found");
            return;
        }
        System.out.println("Got query" + query);
        String[] vals = query.split("=");
        if (vals[0].equals("room")) {
            String roomValue = vals[1];
            System.out.println("Got room " + roomValue);
            sessionIdRoomMap.put(webSocketSession.getId(), roomValue);
            sessionHashMap.put(String.valueOf(webSocketSession.hashCode()), webSocketSession);
            if (!sessionMap.containsKey(roomValue)) {
                sessionMap.put(roomValue, new ArrayList<WebSocketSession>());
            }
            sessionMap.get(roomValue).add(webSocketSession);

            int selfSocketId = webSocketSession.hashCode();
            String selfSocketStr = Integer.toString(selfSocketId);
            List<String> peerSocketIds = new ArrayList<String>();
            for (WebSocketSession session : sessionMap.get(roomValue)) {
                String socketId = Integer.toString(session.hashCode());
                if (!socketId.equals(selfSocketStr))
                    peerSocketIds.add(socketId);
            }
            WebsocketSRO response = new WebsocketSRO("init");
            HashMap<String, Object> data = new HashMap<String, Object>();
            data.put("socketId", selfSocketStr);
            data.put("peerIds", peerSocketIds);
            response.setData(data);
            String respStr = gson.toJson(response);
            webSocketSession.sendMessage(new TextMessage(respStr));
        }

    }

    @Override
    public void handleMessage(WebSocketSession webSocketSession, WebSocketMessage webSocketMessage) throws Exception {
        String sessionId = webSocketSession.getId();
        String roomId = sessionIdRoomMap.get(sessionId);

        String message = (String) webSocketMessage.getPayload();
        System.out.println("Got message " + roomId+":"+ String.valueOf(webSocketSession.hashCode()) + "-> " + message);

        WebsocketSRO sro = gson.fromJson(message, WebsocketSRO.class);
        if (sro.getOnlyTo().equals("")) {
            System.out.println("Sending to all");
            for (WebSocketSession session : sessionMap.get(roomId)) {
                if (session != webSocketSession) {
                    session.sendMessage(webSocketMessage);
                }
            }
        } else {
            System.out.println("Sending to " + sro.getOnlyTo());
            sessionHashMap.get(sro.getOnlyTo()).sendMessage(webSocketMessage);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession webSocketSession, Throwable throwable) throws Exception {
        System.out.println("Transport error in " + webSocketSession.getId());

    }

    @Override
    public void afterConnectionClosed(WebSocketSession webSocketSession, CloseStatus closeStatus) throws Exception {
        System.out.println("Connection Closed");
        String roomId = sessionIdRoomMap.get(webSocketSession.getId());
        if (roomId == null) {
            System.out.println("Room not found when closing");
            return;
        }

        List<WebSocketSession> sessions = sessionMap.get(roomId);
        sessions.remove(webSocketSession);
        sessionIdRoomMap.remove(webSocketSession.getId());
    }

    @Override
    public boolean supportsPartialMessages() {
        return true;
    }
}
