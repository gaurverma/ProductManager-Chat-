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
    socket.on('joinRoom',async({username,room,email,password})=>{

       //Authentication

       try{
        console.log(email + " " + password);
        const user = await Register.findOne({email:email});
        if(user && user.passwrd == password){

            const user = userJoin(socket.id, username, room);
            socket.join(user.room);
    
            //Welcoming message

            socket.emit('message',formatMessage(botName,`Hello ${user.username}! Welcome to RoomChat`));
    
            //broadcasting to other users that a new user has connected

            socket.broadcast.to(user.room).emit('message',formatMessage(botName,`User: ${user.username} has joined the Room: ${user.room}`));
    
            try{
                const socketid = socket.id;
                const registeruser =  new User({
                    socketid,username,room,email
                })
                const registered = await registeruser.save();
            }catch(e){
                console.log(e);
            }
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: await User.find({room:user.room})
            });
        }else{
            socket.emit("Invalidmailpass");
        }
    }catch(e){
        console.log(e);
    }
        

    });

     // taking the chatmessage on server side

     socket.on('chatMessage',async(msg)=>{
        const socketid = String(socket.id);
        const user = await User.findOne({socketid:socketid});
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //display page

    socket.on('displayprompt',async(socketid)=>{
        console.log("yes i got it");
        const user = await User.findOne({socketid:socketid});
        io.emit('prompt',user);
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



app.get("/register",(req,res)=>{
    console.log("called me!")
    res.render("register");
})

app.post("/register",async(req,res)=>{
    try{
        const {fname,lname,contact,email,address,userid,passwrd} = req.body;
        const registeremployee =  new Register({
            fname,lname,contact,email,address,userid,passwrd 
        })

        const registered = await registeremployee.save();
        res.sendFile(path.join(static_path,'index.html'));

    }catch(e){
        console.log(e);
        res.status(400).send(e);
    }
})

app.get('/display', (req, res) => {
    User.find({}, function(err, users) {
        res.render('display', {users: users});
    })
})


server.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
})