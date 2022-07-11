const mongoose = require("mongoose");
//const Port = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FormRegistration";
const DB = "mongodb+srv://vermagaur:Dev567@cluster0.uzvy3.mongodb.net/nodejsintern?retryWrites=true&w=majority"
mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser:true,
}).then(()=>{
    console.log("connection succesfull");
}).catch((e)=>{
    console.log(e);
    console.log("No connection");
})