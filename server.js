// require express and path
var express = require("express");
var path = require("path");
// create the express app
var app = express();
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
});

// Routes go here
app.get('/', function(req, res) {
    res.render("index");
})

// Sockets for listening to different events
var io = require('socket.io').listen(server);

// Hold all the messages in an array
var messages = [];
io.sockets.on('connection', function(socket){
    // Create a variable to hold the username. This is used when the user disconnects
    var username;
    // All the socket code goes in here.
    // When the page loads, prompt the user for a name to be used as a username in chatroom
    socket.on("page_load", function(user_data){
        // console.log(user_data.name);
        username = user_data.name;
        socket.emit("load_chatroom", { messages: messages,});
        socket.broadcast.emit("entered_chatroom", {name: user_data.name})
    })
    // Submitting a message will append data into an array to be displayed to all browsers.
    socket.on("submit_message", function(data){
        messages.push([data.name, data.message, data.date])
        io.emit("update_chat", {name: data.name, message: data.message, date: data.date})
    })
    // When a user closes their browser, let others know that a specific user left.
    socket.on("disconnect", function(){
        socket.broadcast.emit("user_left", {name: username})
    })
})
