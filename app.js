var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);

try{
    mongoose.connect("mongodb://localhost:27017/mysite");
    var db = mongoose.connection ; 
}
catch (error) {
    handleError(error);
}

var userSchema = new mongoose.Schema({
    first_name : String,
    last_name : String,
    email : String, 
    phone_no : Number,
    gender : String,
    username : {type: String, required: true, unique:true}, 
    password : {type: String, required: true},
    confirm_password : {type: String, required: true},
});

var usermodel = mongoose.model("user",userSchema); 

db.once("connected" , function(){
    console.log("connected!!!");
});

app.use(morgan('common'));

app.use(session({
    secret : "secret" , 
    resave : false , 
    saveUninitialized : true ,
    store : new mongoStore({ mongooseConnection : db })
}))

app.use(express.static(__dirname + '/templates'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.get('/',function(req, res, next)
{
    res.sendFile(__dirname + "/templates/index.html") ;
})

app.get('/register',function(req, res, next)
{
    res.sendFile(__dirname + "/templates/register.html") ;
})

app.get('/login',function(req, res, next)
{
    res.sendFile(__dirname + "/templates/login.html") ;
})

app.get('/logout',function(req, res, next)
{
    res.sendFile(__dirname + "/templates/index.html") ;
})

app.post('/login', function(req, res){ 
    let userid = req.body.login_username;
    let password1 = req.body.login_password;
    usermodel.findOne({ username : userid } , function(err,user){
        if (err) {throw err}
        if (user != undefined){
            if (user.password == password1){
                req.session.auth = { username : userid};
                console.log(req.session);
                return res.sendFile(__dirname + "/templates/login_sucess.html");
            }
            else {
                console.log("password not valid");
                return res.sendFile(__dirname + "/templates/login.html");
            }
        }
        else{
            console.log("user not registered!");
            return res.sendFile(__dirname + "/templates/login.html");
        }
    })
}) 
app.post('/register', function(req, res){ 
    let userid = req.body.username;
    let password1 = req.body.password;
    let confirm_password = req.body.cpassword
    let email1 = req.body.email;
    let phone_no1 = req.body.phone_no;
    let gender1 = req.body.gender;
    let firstname1 = req.body.firstname;
    let lastname1 = req.body.lastname;

    if ( userid.length && password1.length ) {
        if ( password1.length >= 8 ) {
            if(password1 == confirm_password)
            {
            usermodel.find({username : userid} , function (err,users) {
                if (err) {throw err}
                else if ( users.length ) {
                    return res.sendFile(__dirname + "/templates/login.html");
                }
                else {
                    var newUser = new usermodel({
                        firstname : firstname1,
                        lastname : lastname1,
                        email : email1,
                        phone_no : phone_no1,
                        gender : gender1,
                        username : userid,
                        password : password1,
                    });
                db.collection('users').insertOne(newUser,function(err,collection){ 
                    if (err) throw err; 
                    console.log("Record inserted Successfully");         
                }); 
                return res.sendFile(__dirname + "/templates/login.html");
                }
            })
            }
            else
            {
                console.log("Confirm-Password Does not match!");
                return res.sendFile(__dirname + "/templates/register.html");    
            }
        }
        else {
            console.log("Please enter a password with more than 8 latters");
            return res.sendFile(__dirname + "/templates/register.html");
        }
    }
    else {
        console.log("Username or Password is not valid");
        return res.sendFile(__dirname + "/templates/register.html");
    }      
}); 

app.listen('5001',()=>
{
    console.log('server start')
})