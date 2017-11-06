var net = require('net');

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(3000, function() {
  console.log('server listening to %j', server.address());
});


var currentConnection = null;

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

  conn.setEncoding('hex');

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  conn.write("105B015C16", "hex");

  currentConnection = conn;

  function onConnData(d) {
    console.log('connection data from %s: %j', remoteAddress, d);
    if(d == "e5"){
      //console.log("trying to disconnect.");
      conn.write("105B015C16", "hex");
      //conn.end();
    }
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
}
