$(document).ready(function () {
    var isAuth = false ;
    
    $("#login").click(function () {
        console.log({ username : $("#username").val() ,password :  $("#password").val() }) ;
        $.post("/login" , { username : $("#username").val() ,password :  $("#password").val() } , function (data) {
            $("#info").append("<p>" + data['status'] + " || " + data['msg'] + " </p>") ;
            if (data['status']) {
                getInfo() ;
            };
        });
    });

    $("#signUp").click(function () {
        $.post("/signup" ,{ first_name : $("#first_name").val(), last_name : $("#last_name").val(), email : $("#email").val(), gender : $("#gender").val(), username : $("#username").val() ,password :  $("#create_pass").val() 
        }); 
    }); 
});