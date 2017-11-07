/*--- Imports ---*/

var utils = require('./utilities');
var net = require('net');


/*--- Const ----*/

const MAX_DEVICES = 250;
const TIMEOUT = 1500;


/*--- Attributes ----*/

var server = net.createServer();
var currentIteration = 0;
var timeout = null;

/*--- Life Cycle ---*/

server.on('connection', handleConnection);


server.listen(3000, function() {
  console.log('server listening to %j', server.address());
});



function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;

  //Open connection
  console.log('new client connection from %s', remoteAddress);

  conn.setEncoding('hex');

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  startDataHandling();

  function onConnData(d) {
    console.log('connection data from %s: %j', remoteAddress, d);

    if(d == "e5"){
      console.log("Ack received.");
      stopTimeout();
      var id = utils.int2hex(currentIteration);
      var crc = utils.checksum("7B" + id);

      conn.write("107B" + id + crc + "16", "hex");
    }
    else {
      //Analysis
      //Next iteration
      nextDataIteration();
    }
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }


  function onConnError(err) {
    console.log('connection %s error: %s', remoteAddress, err.message);
  }


  function startDataHandling() {
    currentIteration = 0;
    nextDataIteration();
  }


  function nextDataIteration() {
    currentIteration++;

    if(currentIteration > MAX_DEVICES ){
      endDataHandling();
      return;
    }

    var id = utils.int2hex(currentIteration);
    var crc = utils.checksum("40" + id);

    var msg = "1040" + id + crc + "16";
    startTimeout();
    console.log("sending: " + msg);

    conn.write(msg, "hex");
  }


  function endDataHandling() {
    conn.end();
  }


  function startTimeout(){
    timeout = setTimeout(function () {
      nextDataIteration();
    },  TIMEOUT);
  }

  function stopTimeout(){
      clearTimeout(timeout);
  }
}
