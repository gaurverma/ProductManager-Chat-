const express = require("express");
const app = express();
const http = require('http');
const path = require("path");
const hbs =  require("hbs");
const Register = require("./models/register");
const User = require("./models/user");
const socketio = require("socket.io");
const formatMessage = require("../utils/message");
const {userJoin} = require("../utils/users");
  
require("./db/conn");
require('dotenv').config();

const port = process.env.PORT||5000;
const server = http.createServer(app);
const io = socketio(server);

const static_path = path.join(__dirname,"../public");
const views_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
const botName = 'Mobzway RoomChat bot';

io.on('connection',socket=>{
    socket.on('joinRoom',async({username,room})=>{
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Welcoming message
        socket.emit('message',formatMessage(botName,`Hello ${user.username}! Welcome to RoomChat`));

        //broadcasting to other users that a new user has connected
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`User: ${user.username} has joined the Room: ${user.room}`));

        //const user = userJoin(socket.id, username, room);
        try{
            const socketid = socket.id;
            const registeruser =  new User({
                socketid,username,room
            })
            const registered = await registeruser.save();
        }catch(e){
            console.log(e);
            res.status(400).send(e);
        }

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: await User.find({room:user.room})
        });

    });

     // taking the chatmessage on server side
     socket.on('chatMessage',async(msg)=>{
        const user = await User.findOne({socketid:socket.id});
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //on client disconnection
    socket.on('disconnect',async()=>{
        const socketid = String(socket.id);
        const user = await User.findOne({socketid:socketid});
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`User : ${user.username} has left the chat`));
            await User.deleteOne({socketid:socket.id});
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: await User.find({room:user.room})
            });
        }
        
    });

});

app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",views_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get("/login",(req,res)=>{
    res.sendFile(path.join(static_path,"index.html"));
});

app.post("/user",async(req,res)=>{
    res.status(204).send();
})

app.post("/login",async(req,res)=>{
    try{
        const email = req.body.mail;
        const password = req.body.passwrd;
        console.log(email + " " + password);
        const user = await Register.findOne({email:email});
        console.log(user);
        if(user.passwrd == password){
            res.sendFile(path.join(static_path,"index.html"));
        }else{
            res.send("Invalid email or Password");
        }

    }catch(e){
        console.log(e);
        res.status(400).send("Invalid email or Password");
    }})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
    try{
        const {fname,lname,contact,email,address,userid,passwrd} = req.body;
        const registeremployee =  new Register({
            fname,lname,contact,email,address,userid,passwrd 
        })

        const registered = await registeremployee.save();
        res.render("login")

    }catch(e){
        console.log(e);
        res.status(400).send(e);
    }
})

server.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
})