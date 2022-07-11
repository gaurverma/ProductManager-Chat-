const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const employeeSchema  =  new mongoose.Schema({
    fname: {
        type: String,
        required:true
    },
    lname:{
        type: String,
        required:true
    },
    contact:{
        type: Number,
        min: [1000000001, 'Must be at least 10 digits'],
        max: [9999999999,'Must not be more than 10 digits']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("please enter a valid email id");
            }
        }
    },
    address:{
        type:String,
        required:true
    },
    userid:{
        type: String,
        required: true,
        maxLength: 8
    },
    passwrd: {
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
               throw new Error("please enter a valid password");
            }
        }
    }
})

// employeeSchema.pre("save",async function(next){
   
//         console.log(`the current password is ${this.password}`);
   
//         return;
//     //next();
// })


const Register = new mongoose.model("Register",employeeSchema);
module.exports = Register;

