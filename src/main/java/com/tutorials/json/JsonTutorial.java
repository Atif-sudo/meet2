package com.tutorials.json;

import com.google.gson.Gson;
import com.meet.model.User;

import java.util.HashMap;
import java.util.Map;

public class JsonTutorial {

    public static void main(String[] args) {
        //User user = new User("atif@gmail.com", "password", "Mohd Atif");
        Gson gson = new Gson();
        //String userJson = gson.toJson(user);

        String userJson = "{\"username\":\"mohan@gmail.com\",\"password\":\"pwd\",\"fullName\":\"Mohan Ganeshan\"}";
        User user = gson.fromJson(userJson, User.class);
        System.out.println(user.getUsername() + " " + user.getPassword() + "  " + user.getFullName());
        //System.out.println("Json of user is " + userJson);

        Map<String, Object> myMap = new HashMap<String, Object>();
        myMap.put("afsa", "1");
        myMap.put("band", 121);
        myMap.put("skd", true);
        System.out.println(gson.toJson(myMap));
    }

}
