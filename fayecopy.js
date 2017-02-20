var app = require('http').createServer(handler)
  , url = require('url')
  , fs  = require('fs')
  , faye = require('faye');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
var clientCount=0;
bayeux.bind('handshake', function(clientId) {
	// event listener logic
	console.log("Client Connected: " + clientId);
})

bayeux.bind('subscribe', function(clientId, channel) {
	// event listener logic
	clientCount++;
	console.log(clientCount + " Client: " + clientId + " Subscribed to : " + channel);
})

bayeux.bind('publish', function(clientId, channel, data) {
	// event listener logic
	console.log("Client: " + clientId + " Sent : " + data.Name + " to Channel: " + channel);
})

bayeux.bind('disconnect', function(clientId) {
	// event listener logic
	clientCount--;
	console.log("Client Disconnected: " + clientId);
})

bayeux.attach(app); 
app.listen(81);

bayeux.addExtension({
  incoming: function(message, callback) {
    if (message.channel === '/meta/subscribe' && /\*/.test(message.subscription)) {
      message.error = Faye.Error.channelForbidden(message.subscription);
    }
    callback(message);
  }
});

function handler (req, res) {
	// parse URL
	var requestURL = url.parse(req.url, true);
	if(requestURL.query.salt){
		var pass = decodeURI(requestURL.query.salt);
		if(pass=='akosha101')
    		broadcastMessage(decodeURI(requestURL.query.Name),decodeURI(requestURL.query.CompanyName),decodeURI(requestURL.query.Location),decodeURI(requestURL.query.Amount),decodeURI(requestURL.query.CreatedAt),decodeURI(requestURL.query.CompanyId));
		else
		console.log("Authentication Error");
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end("");

	}
	else{
		fs.readFile(__dirname + '/fayeclient.html',function (err, data) {
    		if (err) {
      			res.writeHead(500);
      			return res.end('Error loading html');
    		}

		res.writeHead(200);
       	res.end(data);
		});
	}

}

function broadcastMessage(Name,CompanyName,Location,Amount,CreatedAt,CompanyId) {
	
	bayeux.getClient().publish('/homePage', { CName: Name,CCompanyName: CompanyName,CLocation: Location,CAmount: Amount,CCreatedAt: CreatedAt, CCompanyId: CompanyId});
    	console.log('TotalClients: ' + clientCount +'---- Name:' + Name + ' CompanyName:' + CompanyName + ' Location:' + Location +' Amount:' + Amount +' CreatedAt:' + CreatedAt +' CompanyId:' + CompanyId);
}


