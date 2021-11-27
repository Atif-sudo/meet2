package com.meet;


import com.meet.model.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;

@Controller
public class UserController {

    List<User> users = new ArrayList<User>();

    @RequestMapping("/signup")
    @ResponseBody
    public String Signup(String username, String password, String fullName) {

        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return "User Already Exists";
            }
        }


        User user = new User(username, password, fullName);
        users.add(user);
        System.out.println("Created user "+ username);
        return "User Created successfully";
    }

    @RequestMapping("/login")
    @ResponseBody
    public String Login(String username, String password) {
        User matchedUser = null;
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                matchedUser = user;
                break;
            }
        }
        if (matchedUser == null) {
            return "Username not found";
        }
        if (matchedUser.getPassword().equals(password)) {
            return "Logged in successfully";
        }
        return "Wrong Password";

    }


}
