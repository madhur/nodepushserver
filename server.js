var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , url = require('url')
  , fs  = require('fs');
 
app.listen(80);
 
function handler (req, res) {
	// parse URL
	var requestURL = url.parse(req.url, true);
 
	// if there is a message, send it
	if(requestURL.query.message){
		sendMessage(decodeURI(requestURL.query.message),decodeURI(requestURL.query.userName));
	// end the response
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("");
}
	else
	fs.readFile(__dirname + '/client.html',function (err, data) {
    		if (err) {
      			res.writeHead(500);
      			return res.end('Error loading index.html');
    		}

	res.writeHead(200);
       res.end(data);
       });
 
}
 
function sendMessage(message,userName) {
	io.sockets.emit('notification', {'message': message, 'userName':userName});
}


