var http = require('http');
var url = require('url');
let users_list = [];
var last_id = 0;


var server = http.createServer( function(request, response) {
        console.log("REQUEST: " + request.url );
        var url_info = url.parse( request.url, true ); //all the request info is here
        var pathname = url_info.pathname; //the address
        var params = url_info.query; //the parameters
        response.end("OK!"); //send a response
});

server.listen(9042, function() {
        console.log("Server ready!" );
});

var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    
    var user = {
      socket: connection,
      id: last_id,
      room: "init",
      username: "default",
      logKeeper: 0
    };
    
    last_id++;
    //guardar usuario
    users_list.push(user);
    console.log("NEW WEBSOCKET USER!!!");
    
    //send id to the user
     var msg = {
        content: "Welcome! Your user ID is: " + user.id,
        username: "server",
        type: "newid",
        userid: user.id
    };
    
    
    connection.send(JSON.stringify(msg));
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
                console.log( "NEW MSG: " + message.utf8Data ); // process WebSocket message
                var message_obj = JSON.parse(message.utf8Data);
                var message_type = message_obj.type;
                
                if(message_type == "newconnection"){
                    
                    console.log("message is of type newconnection");
                    //search for the user in users_list that has id = msg.content
                    var index = getUserPositionById(message_obj.userid);
                    if(index != -1){
                        users_list[index].room = message_obj.content;
                        users_list[index].username = message_obj.username;
                        if(message_obj.content == "keeper"){
                            users_list[index].logKeeper = 1;
                        }
                        
                        var senderId = message_obj.userid;
                        
                         var msg = {
                            content: "New user connected",
                            username: "server",
                            type: "newuser",
                            positionX: message_obj.positionX,
                            positionY: message_obj.positionY,
                            userid: user.id,
                            avatar: message_obj.avatar
                        };
                        
                        console.log("sending message..." + JSON.stringify(msg));
                        
                        
                    for(i = 0; i<users_list.length; i++){
                        if(users_list[i].room == message_obj.content && users_list[i].id != senderId){
                            //console.log(senderId);
                            
                            users_list[i].socket.send(JSON.stringify(msg));
                            //console.log("sending message");
                        }
                    }
                        
                        
                    }else{
                        console.log("user not found :(");
                    }
                    
                    
                }else if(message_type == "message"){
                    //type == "message", so we have to send to other users in the room
                    console.log("message is of type message");
                    
                    var index = getUserPositionById(message_obj.userid);
                    var target_room = "";
                    if(index != -1){
                        target_room = users_list[index].room;
                    }
                    
                    //send to each user in room
                    for(i = 0; i<users_list.length; i++){
                        if(users_list[i].room == target_room && message_obj.receivers.includes(users_list[i].id)){
                            users_list[i].socket.send(message.utf8Data);
                        }
                    }
                    
                    
                    
                }else if(message_type == "log"){
                                     
                    var index = getUserPositionById(message_obj.destiny_id);
                    
                    if(index != -1){
                        users_list[index].socket.send(JSON.stringify(message_obj));
                    }
                    
                }else if(message_type == "move"){
                     console.log("message is of type move");
                    
                    var index = getUserPositionById(message_obj.userid);
                    var target_room = "";
                    var senderId = message_obj.userid;
                    if(index != -1){
                        target_room = users_list[index].room;
                    }
                    
                    //send to each user in room
                    for(i = 0; i<users_list.length; i++){
                        if(users_list[i].room == target_room && users_list[i].id != senderId){
                            users_list[i].socket.send(message.utf8Data);
                        }
                    }
                    
                }               
                
                
        }
    });

    connection.on('close', function(connection) {
            console.log("USER IS GONE"); // close user connection
            var index = getUserPositionBySocket(this);
            var target_room = users_list[index].room;
            
            var msg = {
                content: "someone left the room :(",
                username: "server",
                type: "out",
                userid: users_list[index].id
            };

            users_list.splice(index, 1);//deleting the user that is out
            
            for (i = 0; i < users_list.length; i++) {
                if (users_list[i].room == target_room) {   
                    users_list[i].socket.send(JSON.stringify(msg)); //telling the other users that someone is out
                }
            }
    });
});


function getUserPositionById(id){
    var res = -1;
    var index = 0;
    
    while(index < users_list.length){                        
        if(id == users_list[index].id){
            res = index;
            break;
        }
        index++;
    }
    return res;    
}

function getUserPositionBySocket(socket){
    var res = -1;
    var index = 0;
    
    while(index < users_list.length){                        
        if(socket == users_list[index].socket){
            res = index;
            break;
        }
        index++;
    }
    return res;    
}











