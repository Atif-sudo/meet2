package com.github.joelbars.socket;

import static java.util.Collections.emptySet;

import java.io.IOException;
import java.io.StringReader;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.github.joelbars.Room;

/**
 * Created by joel on 21/05/15.
 */
@ServerEndpoint("/ws/{room}")
public class WebSocketListener {

    private ConcurrentMap<String, Set<Session>> rooms = Room.INSTANCE.map();

    private static final Set<Session> EMPTY_ROOM = emptySet();

    @OnOpen
    public void onOpen(Session peer, @PathParam("room") String room) throws IOException {
        System.out.println("Got room "+ room);
        try {
            if (room != null && !room.isEmpty()) {
                rooms.computeIfAbsent(room, s -> new CopyOnWriteArraySet<>()).add(peer);
                peer.getBasicRemote().sendText(Json.createObjectBuilder().add("type", "assigned_id").add("id", room).build().toString());
            } else {
                peer.close();
            }
        }catch (Exception exception){
            System.out.println("Got exception " + exception.toString());
            throw  exception;
        }
        
    }

    @OnClose
    public void onClose(Session peer, @PathParam("room") String room) throws IOException {
        Optional.ofNullable(rooms.get(room))
                .orElseThrow(() -> new IllegalStateException("Cannot find room " + room))
                .remove(peer);
        rooms.getOrDefault(room, EMPTY_ROOM)
        	.parallelStream()
        	.filter(s -> s.isOpen())
        	.forEach(s -> s.getAsyncRemote()
        			.sendText(Json.createObjectBuilder().add("type", "connection_closed").add("peer", peer.getId()).build().toString()));
    }

    @OnError
    public void onError(Session peer, Throwable th, @PathParam("room") String room) {
        System.out.println("Peer error " + room + " " + th);
    }

    @OnMessage
    public void onMessage(String message, Session peer, @PathParam("room") String room) throws IOException {
        JsonObject o = Json.createReader(new StringReader(message)).readObject();
        String type = o.getString("type");
        switch(type) {
        case "received_offer": 
        case "received_candidate":
        case "received_answer":
            System.out.println("Forwarding message "+ type.toString());
            Set<Session> peers = rooms.getOrDefault(room, EMPTY_ROOM);
            for (Session s:peers) {
                if (s!= peer && s.isOpen()){
                    System.out.println("Sending  " + message + " to " + s.getId());
                    s.getBasicRemote().sendText(message);
                }
            }
        	break;
        case "close":
        	peer.close();
        }
    }
}
