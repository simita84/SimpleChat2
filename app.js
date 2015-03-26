// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// require body-parser
var bodyParser = require('body-parser');
// create the express app
var app = express();
// use it!
app.use(bodyParser.urlencoded());
// static content 
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
})
 
app.get('/back', function(request, response) {
  var message ="Bye !!! see you later";
  response.render("index",{message : message});
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
 

var chat_name; 
app.post('/chat_room',function(request, response){
  chat_name = request.body.name;
  if(chat_name){
    response.render('chat_room',{user_name:chat_name});
  }
  else
  {
    var message = "Please enter a name !!!";
    response.render("index",{message : message});
  }
  
})
 
var all_users    = new Array();
//var all_messages = new Array();
var count = 0;
var user_info ;
var index = 1;


io.sockets.on('connection', function (socket) {
    //all the socket code goes in here!

    
  // #1 - New user connected recieving event

	socket.on("got_new_user", function (data){
		 
		new_user_info = {
	     socket_id   :  socket.id ,
	     name        :  data.user_name
		}

	  socket.session_id = index;

	  all_users[socket.session_id] = new_user_info;
	  index++;
    console.log("------Connecting-----------",data.user_name);

    //Broadcast data from the server to everyone BUT the client that initiated the contact.
    socket.broadcast.emit('new_user_connected', {user_details: new_user_info});

    // Emit: sends data from the server to the specific client who initiated contact.
    socket.emit('all_users', {existing_users: all_users});

   //  //Broadcasting info of new client to all the existing clients
	  // socket.broadcast.emit('new_user_added', {id:  socket.id , name:  data.user_name });

	  // //Sending info of  all connected users to the newly connected client
	  // console.log(all_users);
	  // io.emit('all_users',{users :all_users,current_user :data.user_name});
     //console.log("all users array"+all_users);
	 });
 

 //   // , coun#-------Listens to new chat
			
	// socket.on('new_chat' , function(data){
 //  	console.log(data.message);
 //  	console.log(  socket.session_id );
 //  	user_name = all_users[socket.session_id].name;
 //  	io.emit('add_new_chat', {chat : data.message,name : user_name});
 //  });	
// 

  //Listens to disconnect event
  socket.on('disconnect', function () {
  	console.log("-----Disconnecting--------------");
  	var user_array_index = socket.session_id;
   
    //Remove from UI and array
  	if(user_array_index){
      console.log("-----Disconnecting--------------");
    	//console.log(all_users[user_array_index].name);
    	var user_to_remove   = all_users[user_array_index].name; 
    	var id 						   = all_users[user_array_index].socket_id;

       //Remove from users array
      all_users.splice(user_array_index, 1);

    	console.log("-------"+user_to_remove+" with "+id+" removed --------");

      
    	//-------------Broadcast to everyone if someone is removed ----------------
    	io.emit('remove_user', {user_name :user_to_remove, id :id});
     }
     //Verify all users are disconnected
      console.log("all users array"+all_users);
	});
 
}); //---------------End of connection
 		 

   
		//Server-side emit syntax

		// 1. Emit: sends data from the server to the specific client who initiated contact.
		//socket.emit('server_response', {response: "sockets are the best!"});

		// 2. Broadcast: sends data from the server to everyone BUT the client that initiated the contact.
		//socket.broadcast.emit('server_response', {response: "sockets are the best!"});

		// 3. Full Broadcast: sends data to all connected clients.
		//io.emit('server_response', {response: "sockets are the best!"});
 


