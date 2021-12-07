package com.meet.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.meet.websocket.WebsocketSRO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Type;
import java.net.URLDecoder;
import java.util.*;

// #TODO implement synchronization

@Controller
public class EventController {

    private final Map<String, List<String>> roomUserMap;
    private final Map<String, String> userIdRoomMap;
    private final Map<String, List<WebsocketSRO>> userEventMap;
    private final Map<String, String> roomOwnerMap;
    private static final Object lock = new Object();
    private static final Gson gson = new Gson();

    private static final Type eventListType = new TypeToken<ArrayList<WebsocketSRO>>() {
    }.getType();


    public EventController() {
        userEventMap = new HashMap<>();
        roomUserMap = new HashMap<>();
        userIdRoomMap = new HashMap<>();
        roomOwnerMap = new HashMap<>();
    }

    @RequestMapping("/new_room")
    @ResponseBody
    public String newRoom(){
        String roomId = UUID.randomUUID().toString().substring(0, 10);
        while(roomOwnerMap.containsKey(roomId)){
            roomId = UUID.randomUUID().toString().substring(0, 10);
        }
        roomOwnerMap.put(roomId, null);
        Map<String, Object> result = new HashMap<>();
        result.put("room_id", roomId);
        return gson.toJson(result);

    }

    @RequestMapping("/init")
    @ResponseBody
    public String initUser(@RequestParam String roomId) {
        String userId = UUID.randomUUID().toString();
        //userId = userId.replace("-","");
        //userId = userId.substring(5, 13);
        if (!roomUserMap.containsKey(roomId)) {
            List<String> userIds = new ArrayList<>();
            roomUserMap.put(roomId, userIds);
            roomOwnerMap.put(roomId, userId);
        }
        roomUserMap.get(roomId).add(userId);

        userEventMap.put(userId, new ArrayList<>());

        userIdRoomMap.put(userId, roomId);
        HashMap<String, Object> result = new HashMap<>();
        result.put("socketId", userId);
        List<String> peers = new ArrayList<>();
        for (String peerId : roomUserMap.get(roomId)) {
            if (peerId != userId) {
                peers.add(peerId);
            }
        }
        result.put("peerIds", peers);
        WebsocketSRO resp = new WebsocketSRO("init");
        resp.setData(result);
        return gson.toJson(resp);
    }

    @RequestMapping(value = "/events", method = RequestMethod.POST)
    @ResponseBody
    public String updateEvents(@RequestBody String eventsStr) {

        String decodedString = URLDecoder.decode(eventsStr);
        System.out.println("GOt event " + decodedString);
        WebsocketSRO event = gson.fromJson(eventsStr, WebsocketSRO.class);
        List<WebsocketSRO> events = Arrays.asList(event);

        for (WebsocketSRO sro : events) {
            String senderId = sro.getFromId();
            String roomId = userIdRoomMap.get(senderId);

            if (sro.getOnlyTo().equals("") ) {
                System.out.println("Sending to all");
                for (String peerId : roomUserMap.get(roomId)) {
                    if (!peerId.equals(senderId)) {
                        synchronized (lock) {
                            userEventMap.get(peerId).add(sro);
                        }
                    }
                }
            } else {
                String peerId = sro.getOnlyTo();
                synchronized (lock) {
                    userEventMap.get(peerId).add(sro);
                }

            }


        }

        return "{\"status\":true}";

    }

    @RequestMapping(value = "/events", method = RequestMethod.GET)
    @ResponseBody
    public String getEvents(@RequestParam String userId) {

        List<WebsocketSRO> userEvents;
        synchronized (lock) {
            userEvents = userEventMap.get(userId);
            if (!userEvents.isEmpty()) {
                userEventMap.put(userId, new ArrayList<>());
            }
        }
        return gson.toJson(userEvents);
    }


}

