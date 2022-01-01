//vars

var username = "";
var roomid = "";
var isLogKeeper = false;
var logMessages = [];
var my_id = 0;
var my_avatar = 0;

var usuarios = [];
var canvas = document.getElementById('myCanvas');
var posX = Math.random() * (600 -10 - 10) + 10;
var posY = Math.random() * (400 -10 - 10) + 10;  

//connection to the server:
//var socket = new WebSocket("wss://ecv-etic.upf.edu/node/9042/ws/");
var socket = new WebSocket("ws://localhost:9042");
socket.onopen = function(){  
    console.log("Socket has been opened! :)");
    //this.send('Hello server!');  //send something to the server
}

socket.addEventListener("close", function(e) {
    console.log("Socket has been closed: ", e); 
});


socket.onerror = function(err){  
    console.log("error: ", err );
}

//listener for the avatar selector

var login_container = document.getElementById("imagecontainer");
var avatar_selector = document.getElementById("avatar_picker");
var avatar = document.getElementById("avatarimage");
var profile = document.getElementById("profilepic");

function selectAvatar(e){

    if(avatar_selector.value == "Man1"){
        avatar.setAttribute("src", "images/man1.png");
        profile.setAttribute("src", "images/man1.png");
        my_avatar = 0;
    }else if(avatar_selector.value == "Man2"){
        avatar.setAttribute("src", "images/man2.png");
        profile.setAttribute("src", "images/man2.png");
        my_avatar = 1;
    }else if(avatar_selector.value == "Man3"){
        avatar.setAttribute("src", "images/man3.png");
        profile.setAttribute("src", "images/man3.png");
        my_avatar = 2;
    }
    else if(avatar_selector.value == "Man4"){
        avatar.setAttribute("src", "images/man4.png");
        profile.setAttribute("src", "images/man4.png");
        my_avatar = 3;
    }
    else if(avatar_selector.value == "Woman1"){
        avatar.setAttribute("src", "images/woman1.png");
        profile.setAttribute("src", "images/woman1.png");
        my_avatar = 4;
    }
    else if(avatar_selector.value == "Woman2"){
        avatar.setAttribute("src", "images/woman2.png");
        profile.setAttribute("src", "images/woman2.png");
        my_avatar = 5;
    }
    else if(avatar_selector.value == "Woman3"){
        avatar.setAttribute("src", "images/woman3.png");
        profile.setAttribute("src", "images/woman3.png");
        my_avatar = 6;

    }else{
        avatar.setAttribute("src", "images/woman4.png");
        profile.setAttribute("src", "images/woman3.png");
        my_avatar = 7;
    }
    
}

avatar_selector.addEventListener('click', selectAvatar);
avatar_selector.addEventListener('change', selectAvatar);



function onMessageReceived(str_msg) {
    console.log(str_msg.data);
    var msg = JSON.parse(str_msg.data);
    
    if(msg.type == "newid"){ //when the server assigns me an id I receive it and store it
        my_id = msg.userid;
    }
    else if(msg.type == "message"){
        if(msg.username != username){
            var html = '<div class= "message_received"><p class="username_sender">' + msg.username + ':</p><p class="content_message_rec">' + msg.content + '</p></div>';
            document.getElementById('result').innerHTML += html;
            document.getElementById('scroll').scrollTop = 100000;
        
        }        
    }else if(msg.type == "newuser"){
        
        console.log("new user entered the room");
        
        var newuser = {
            positionX: msg.positionX,
            positionY: msg.positionY,
            destinyX: 0,
            destinyY: 0,
            avatar: msg.avatar,
            id: msg.userid
        };
        
        usuarios.push(newuser);
        
        if(usuarios.length == 1){
            isLogKeeper = true; 
        }
        
        
        if(isLogKeeper){
            console.log("soy el guardian, aqui te mando los logs :)");
            
            for(i=0; i<usuarios.length; i++){            
                if(usuarios[i].id != msg.userid){ //no enviar log del destinatario, seria mandarle su propia informacion
                    var log = {
                    type: "log",
                    destiny_id: msg.userid,
                    positionX: usuarios[i].positionX,
                    positionY: usuarios[i].positionY,
                    userid: usuarios[i].id,
                    avatar: usuarios[i].avatar
                    
                    };            
                    socket.send(JSON.stringify(log));
                }              
            }
            
            var log = {
                    type: "log",
                    destiny_id: msg.userid,
                    positionX: posX,
                    positionY: posY,
                    userid: my_id,
                    avatar: my_avatar        
           };
            
           socket.send(JSON.stringify(log));         
            
        }       
        
    }else if(msg.type == "log"){
        var newuser = {
            positionX: msg.positionX,
            positionY: msg.positionY,
            destinyX: msg.positionX,
            destinyY: msg.positionY,
            avatar: msg.avatar,
            id: msg.userid
        };
        
        usuarios.push(newuser);
    
        
    }else if(msg.type == "move"){
       
        console.log(JSON.stringify(msg));
        
        var index = 0;
        for(i=0; i< usuarios.length; i++){
            if(msg.userid == usuarios[i].id){
                index = i;
                usuarios[index].destinyX = msg.positionX;
                usuarios[index].destinyY = msg.positionY;
            }
            
        }
               
        
    }else if(msg.type == "out"){
        console.log(JSON.stringify(msg));
        
        var index = 0;
        for(i=0; i< usuarios.length; i++){
            if(msg.userid == usuarios[i].id){
                index = i;
                usuarios.splice(index, 1);//deleting the user that is out
            }
            
        }
    }
    
    
}

socket.onmessage = onMessageReceived;

function onNewUser(user_id) {
    for (i = 0; i < logMessages.length; i++) {
        socket.send(JSON.stringify(logMessages[i]), [user_id]);
    }

}
//server.on_user_connected = onNewUser;

function getOffice(x, y){
    var res = 0;
    var linesX = [canvas.width/3, canvas.width*(2/3)];
    var linesY = [canvas.height/3, canvas.height*(2/3)];
    
    if(x < linesX[0]){
        if(y < linesY[0]){
            res = 1;
        }else if(y > linesY[1]){
            res = 7;
        }else{
            res = 4;
        }
    }else if(x > linesX[1]){
        if(y < linesY[0]){
            res = 3;
        }else if(y > linesY[1]){
            res = 9;
        }else{
            res = 6;
        }
        
    }else{
        if(y < linesY[0]){
            res = 2;
        }else if(y > linesY[1]){
            res = 8;
        }else{
            res = 5;
        } 
    }
    
    console.log("You are in office " + res);
    return res;
    
}



function say_hi() {
    var text = document.getElementById('messagebox').value;
    var html = '<div class= "message"><p class="content_message">' + text + '</p></div>';
    document.getElementById('result').innerHTML += html;
    document.getElementById('scroll').scrollTop = 100000;

    var destinatarios = [];
    
   
    var myPosition = getOffice(posX, posY);    
    
    for(i = 0; i<usuarios.length; i++){
        var tempPosition = getOffice(usuarios[i].positionX, usuarios[i].positionY);
        
        if(tempPosition == myPosition){
            destinatarios.push(usuarios[i].id);
        }        
        
    }

    var msg = {
        content: "",
        username: "",
        type: "message",
        userid: my_id,
        receivers: destinatarios
    };
    
    msg.content = text;
    msg.username = username;
    
    socket.send(JSON.stringify(msg));

    document.getElementById('messagebox').value = "";

}

function onStart() {
    roomid = document.getElementById('room').value;
    username = document.getElementById('username').value;

    //send values to the server
    var msg = {
        content: roomid,
        username: username,
        type: "newconnection",
        userid: my_id,
        positionX: posX,
        positionY: posY,
        avatar: my_avatar
    };
    socket.send(JSON.stringify(msg));
    

    //hide login popup
    var loginbox = document.getElementById('login');
    loginbox.style.visibility = "hidden";

    //load page
    document.getElementById("wrap").setAttribute("style", " -webkit-filter: blur(0px)");
    document.getElementById('me').innerHTML += "<p class=name>" + username + " - "+ roomid + "  "+"</p>";

}

var input = document.getElementById('messagebox');

input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("say").click();
    }
});

document.getElementById('enter').addEventListener('click', onStart);
