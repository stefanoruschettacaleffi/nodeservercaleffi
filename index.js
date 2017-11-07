/*--- Imports ---*/

var utils = require('./utilities');
var net = require('net');


/*--- Const ----*/

const MAX_DEVICES = 250;
const TIMEOUT = 20000;


/*--- Attributes ----*/

var server = net.createServer();
var currentIteration = 0;
var timeoutCounter = null;
var currentMessage = null;

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

  //Broadcast reset

  var ck = utils.checksum("53FF5000");
  console.log("Sending broadcast reset.")

  conn.write("6804046853FF5000"+ck+"16", "hex");

  ck = utils.checksum("73FF51085B5F3B2B3E2E7C01437C01637C01757C01557C0149");
  conn.write("6819196873FF51085B5F3B2B3E2E7C01437C01637C01757C01557C0149"+ck+"16", "hex");

  startDataHandling();

  function onConnData(d) {


    console.log('id' + currentIteration +' connection data from %s: %j', remoteAddress, d);

    if(d == "e5"){

      console.log('id' + currentIteration +' Ack received.');
      stopTimeout();

      var id = utils.int2hex(currentIteration);
      var crc = utils.checksum("7B" + id);

      conn.write("107B" + id + crc + "16", "hex");
    }
    else {

      //Analysis
      //currentMessage += d;

      //Header analysis
      if( d != null && d.length > 12){
          console.log("id: " + currentIteration + " Got response for: " + utils.hex2int(d.substring(10,12)));
      }

      //Body validation (length + ending char)

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
    stopTimeout();

    if(currentIteration > MAX_DEVICES ){
      endDataHandling();
      return;
    }

    var id = utils.int2hex(currentIteration);
    var crc = utils.checksum("40" + id);

    var msg = "1040" + id + crc + "16";
    startTimeout();
    console.log('id' + currentIteration +' start reading. Sending: ' + msg);

    conn.write(msg, "hex");
  }


  function endDataHandling() {
    conn.end();
  }


  function startTimeout(){
    timeoutCounter = setTimeout(function () {
      console.log('id' + currentIteration + ' on timeout!');
      nextDataIteration();
    },  TIMEOUT);
  }

  function stopTimeout(){
      clearTimeout(timeoutCounter);
  }
}
