var faye = require('faye');

var chatServer = 'http://127.0.0.1/faye'
  , testRoomId = 'homePage'
  , testChannel = '/' + testRoomId;

var clients = [], client, times = {};

for (var i = 0; i < 500; i++) {
  client = new faye.Client(chatServer);
  client.subscribe(testChannel, function(message) {
    var time = new Date().getTime() - times[message.CName];
    console.log(time);
  });
  clients.push(client);
}

setTimeout(function(){
  setInterval(function(){
    for (var i = 0; i < 1; i++) {
      var id = Math.floor(Math.random() * 4096);
      times[id] = new Date().getTime();
      clients[i].disable("websocket");	
      clients[i].publish(testChannel, { CName: id,CCompanyName: id,CLocation: id,CAmount: id,CCreatedAt: id});
    }
  }, 500);
}, 100);