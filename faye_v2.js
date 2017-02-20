var app = require('http').createServer(handler)
  , url = require('url')
  , fs  = require('fs')
  , faye = require('faye');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
var clientCount = 0;

bayeux.bind('handshake', function(clientId) {
	// event listener logic
	console.log("Client Connected: " + clientId);
});

bayeux.bind('subscribe', function(clientId, channel) {
	// event listener logic
	clientCount++;
	console.log(clientCount + " clients. " + clientId + " subscribed to " + channel);
});

bayeux.bind('publish', function(clientId, channel, data) {
	// event listener logic
	console.log("Client: " + clientId + " Sent : " + JSON.stringify(data) + " to Channel: " + channel);
});

bayeux.bind('unsubscribe', function(clientId, channel) {
	// event listener logic
	clientCount--;
	console.log(clientCount + " clients remaining. " + clientId + " unsubscribed from " + channel);
});

bayeux.bind('disconnect', function(clientId) {
	// event listener logic
	console.log("Client Disconnected: " + clientId);
});

bayeux.attach(app); 
app.listen(8001);

bayeux.addExtension({
  incoming: function(message, callback) {
    if (message.channel === '/meta/subscribe' && /\*/.test(message.subscription)) {
      message.error = Faye.Error.channelForbidden(message.subscription);
    }
    callback(message);
  }
});

// Handles requests on Tomcat
function handler (req, res) {
	
	// Get params object
	// http://stackoverflow.com/questions/8590042/parsing-query-string-in-node-js
	var params = url.parse(req.url, true).query;
	
	// Authenticate
	if(params.salt) {
		
		// Decode params
		for(var i in params) {
			i = decodeURI(i);
		}
		
		var pass = params.salt;
		
		if(pass == 'akosha101') {
			broadcastMessage(params.Channel, params);
//			broadcastMessage(decodeURI(params.Name),decodeURI(params.Id),decodeURI(params.CompanyName),decodeURI(params.Location),decodeURI(params.Amount),decodeURI(params.CreatedAt),decodeURI(params.CompanyId),decodeURI(params.CompanyUrl));
		} else {
			console.log("Authentication Error");
		}
		
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end("");
		
	} else {
		fs.readFile(__dirname + '/fayeclient.html', function(err, data) {
			if (err) {
	  			res.writeHead(500);
	  			return res.end('Error loading html');
			}
			res.writeHead(200);
	       	res.end(data);
		});
	}
}

function broadcastMessage(channel, message) {
	bayeux.getClient().publish(channel, message);
}
