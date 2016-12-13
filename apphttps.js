var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var server = https.createServer(options, app);
server.listen(process.env.PORT || 3000);
var io = require("socket.io").listen(server);
//var io = require('socket.io')(server);


app.use(express.static(__dirname + '/simpleRTC'));


app.get("/", function(req, res){
	res.sendFile(__dirname + "/simpleRTC/index.html");	
});


var lstUser = [];
//var lstClientID = [];
io.sockets.on('connection', function (socket) {
	//socketID = socket.id;
	
  console.log("Client has connected : " + socket.id);
  socket.emit('serverguiIDuser', { socketID: socket.id });
    
  
	socket.on('new user', function (data) {
		console.log('username: ' + data.usename);
		console.log('clientID: ' + data.clientID);
		var LoginSuccess = false;
	 
		if ( lstUser.indexOf(data.usename) > -1 ) {
			console.log("User has exists");
			LoginSuccess = false;
		}
		else {
			lstUser.push(data);
			//console.log('list: ' + data.usename + '_' + data.clientID)
			console.log('do dai danh danh sach : ' + lstUser.length)
			LoginSuccess = true;
			socket.un = data;
			io.sockets.emit('server-return-listUer', { danhsach: lstUser });
		 
		}	
	});
	
	
	

	
	//socket.on('call_sinhvien', function(call){
		//io.sockets.emit('return_call_sinhvien', { noidung: call });
	//});
	
	socket.on('call', function (data) {
		console.log(data);
		io.sockets.in(data).emit('server_return_call', {request: 'Bạn nhận được một cuộc gọi.'});
	});
	
	socket.on('scroll', function(dataScroll){
		console.log(dataScroll);
		io.sockets.emit('serverguiScroll', { pos: dataScroll });
	});
	
	
	removeByAttr = function(arr, attr, value){
		var i = arr.length;
		while(i--){
		   if( arr[i] 
			   && arr[i].hasOwnProperty(attr) 
			   && (arguments.length > 2 && arr[i][attr] === value ) ){ 

			   arr.splice(i,1);

		   }
		}
		return arr;
	}
	
	socket.on('disconnect', function () {
	
		console.log('DISCONNECTED: ' + socket.id);
		console.log('++++TRUOC KHI XOA++++>: ' + lstUser.length);
		removeByAttr(lstUser, 'clientID', socket.id);
		console.log('~~~SAU KHI XOA~~~~>: ' + lstUser.length);
		
		io.sockets.emit('server-send-user-exit', { userExit: socket.id });
		
	});
  
});
