package com.tutorials.mongodb;

import com.google.gson.Gson;
import com.meet.model.User;
import com.mongodb.BasicDBObject;
import com.mongodb.client.*;
import com.mongodb.client.result.InsertOneResult;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    private static MongoDatabase db;
    private static Gson gson ;

    public static String Signup(String username, String password, String fullName){
        User user = new User(username, password, fullName);
        Document doc = Document.parse(gson.toJson(user));
        MongoCollection collection =db.getCollection("User");
        InsertOneResult res = collection.insertOne(doc);
        return "success";
    }

    public static String Login(String username, String password){
        User user = new User(username , password);
        Document doc =Document.parse(gson.toJson(user));
        MongoCollection collection = db.getCollection("User");
        BasicDBObject andQuery = new BasicDBObject();
        List<BasicDBObject> obj = new ArrayList<BasicDBObject>();
        obj.add(new BasicDBObject("username", username));
        obj.add(new BasicDBObject("password", password));
        andQuery.put("$and", obj);

        FindIterable res = collection.find(andQuery);
        if(res.first() != null){
            return "Successfully login";
        }

        return "Username Password didn't match";

    }

    public  static  void InputLoop(){
        Scanner scn = new Scanner(System.in);
        while(true){
            System.out.println("Enter 1 for Signup, 2 for login, 3 for exit");
            int input = scn.nextInt();
            if(input==1){
                System.out.println("Enter username");
                String username, password, fullName;
                username = scn.next();
                System.out.println("Enter password");
                password = scn.next();
                System.out.println("Enter Full Name");
                fullName = scn.next();
                String result = Signup(username, password, fullName);
                System.out.println(result);
            }
            else if (input==2){
                System.out.println("Enter username");
                String username, password, fullName;
                username = scn.next();
                System.out.println("Enter password");
                password = scn.next();
                String result = Login(username, password );
                System.out.println(result);
            }
            else if(input==3){
                break;
            }
        }
    }

    public static void main(String[] args)
    {
        MongoClient client = MongoClients.create("mongodb+srv://meet2:12341234@cluster0.cvhz0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

        db =client.getDatabase("MeetDB");
        gson = new Gson();

        MongoCollection collection =db.getCollection("MeetCollection");
        InputLoop();
//       Document SampleDoc = new Document("_id","1").append("name","Mohan");
//
//       // collection.insertOne(SampleDoc);
//        for (Object x:collection.find())
//
//        {
//           Document y= (Document) x;
//
//            System.out.println(y.toJson());
//        }
//        collection.find() ;

    }
}
