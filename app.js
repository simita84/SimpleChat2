// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// require body-parser
//var bodyParser = require('body-parser');
// create the express app
var app = express();
// use it!
//app.use(bodyParser.urlencoded());
// static content 
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
})
// post route for adding a user
/*app.post('/users', function(req, res) {
 console.log("POST DATA", req.body);
 // This is where we would add the user to the database
 // Then redirect to the root route
 res.redirect('/');
})*/
// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})
// this gets the socket.io module *new code!* 
var io = require('socket.io').listen(server);  
// notice we pass the server object<br>
// Whenever a connection event happens (the connection event is built in) run the following code
 
 
var all_users = new Array();
var count = 0;
var user_info ;
var index = 0;
io.sockets.on('connection', function (socket) {
    //all the socket code goes in here!
	
  console.log("------\n-----------WE ARE USING SOCKETS!-----------");
 
  console.log(socket);

  socket.session = "test";

  // #1 - New user connected recieving event
	socket.on("got_new_user", function (data){
			//console.log(socket.id);
			//console.log(data.user_name);
			//console.log('Got New user --> ' + data.user_name +"  with id = "+socket.id);
			new_user_info = {name :  data.user_name , id : socket.id }
			
			// Saving all the users 
			console.log(socket.id );

			//all_users[socket.id ] = data.user_name;

			new_user_info = {
		     socket_id:  socket.id ,
		     name:  data.user_name,
		     all_users_index: index
			}

			index = index+1;

		  all_users.push(new_user_info);

			// #-------sends data from the server to everyone 
					//BUT the client that initiated the contact.
			socket.broadcast.emit('add_user_window', {user_info: new_user_info});

		  // #-- Emit: sends all_users from the server to the specific client who initiated contact.
		  socket.emit('all_users', { user_info : all_users});
	 

		  //# Sends data to all connected clients when somebody leaves the room. 
	    socket.on('disconnect', function () {

	    	//console.log(socket.id);
	    	console.log(all_users);
	    
		    //console.log(data.user_name +"disconnected--------");
		   //  remove_user_info = {name :  data.user_name , id : socket.id }
		      

		  	// for (var i = 0; i < all_users.length; i++) {
		  	// 	console.log("aray"+all_users[i].name);
		  	// 	if(all_users[i].id === remove_user_info.id  ){
		  	// 		console.log(all_users[i].id);
		  	// 		all_users.slice(i,0);
		  	// 	}
		  	// }

		  	// io.emit('remove_user', { user_info : remove_user_info});
	    });

	    socket.on('new_chat' , function(data){

	    	console.log(data.message);
	    	var user_name ;
	    	for (var i = 0; i < all_users.length; i++) {
		  	 
		  		if(all_users[i].id === socket.id   ){
		  			//console.log("matched=="+all_users[i].name);
		  		 user_name =all_users[i].name;
		  		}
		  	}
	    	io.emit('add_new_chat', {chat : data.message,name : user_name});
	    });
  	}); 

		 

   
		//Server-side emit syntax

		// 1. Emit: sends data from the server to the specific client who initiated contact.
		//socket.emit('server_response', {response: "sockets are the best!"});

		// 2. Broadcast: sends data from the server to everyone BUT the client that initiated the contact.
		//socket.broadcast.emit('server_response', {response: "sockets are the best!"});

		// 3. Full Broadcast: sends data to all connected clients.
		//io.emit('server_response', {response: "sockets are the best!"});
 

})
 
