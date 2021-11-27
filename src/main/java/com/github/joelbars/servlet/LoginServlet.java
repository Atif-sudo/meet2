package com.github.joelbars.servlet;

import com.github.joelbars.Room;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.Session;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;

public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 3987695371953543306L;


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        if(password.equals("password")){
            PrintWriter writer = resp.getWriter();
            writer.write("<h1> Hello" + username + " Welcome </h1>");
        }else{
            PrintWriter writer = resp.getWriter();
            writer.write("<h1> Access Denied </h1>");
        }

    }

}
