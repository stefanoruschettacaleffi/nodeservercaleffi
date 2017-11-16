/*--- Imports ---*/

var utils = require('./utilities');
var net = require('net');

var dbmanager = require('./DBManager');


/*--- Const ----*/

const MAX_DEVICES = 250;
const ACK_TIMEOUT = 20000;


/*--- Attributes ----*/

var server = net.createServer();
var currentIteration = 0;
var timeoutAck = null;
var currentMessage = null;


/*--- Life Cycle ---*/
/*
dbmanager.connectToMySQL("127.0.0.1", "root", "paolinopollo", function(con){

    var db_name = "caleffi_db";

    dbmanager.createDBOnConn(con, db_name, function(){

      dbmanager.createMeasuresTableOnDB(con, db_name, function(){

      });
    });
});

*/

server.on('connection', handleConnection);

server.listen(3000, function() {
  console.log('server listening to %j', server.address());
});


/*--- Connection ---*/

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
  //var ck = utils.checksum("73FF50");
  console.log("Sending broadcast reset.")

  conn.write("6804046853FF5000"+ck+"16", "hex");
  //conn.write("6803036873FF50" + ck + "16", "hex");

  ck = utils.checksum("73FF51085B5F3B2B3E2E7C01437C01637C01757C01557C01497C0161");
  conn.write("6828286873FF51085B5F3B2B3E2E7C01437C01637C01757C01557C01497C0161"+ck+"16", "hex");

  startDataHandling();

  function onConnData(d) {

    console.log('Id' + currentIteration +' connection data from %s: %j', remoteAddress, d);

    if(d == "e5"){

      console.log('Id' + currentIteration +' Ack received.');
      stopAckTimeout();

      sendMsgReqOnConn();
    }
    else {

      //Header analysis
      if( d != null && d.length > 12){
          console.log("Id: " + currentIteration + " Got response for: " + utils.hex2int(d.substring(10,12)));
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
    stopAckTimeout();

    if(currentIteration > MAX_DEVICES ){
      endDataHandling();
      return;
    }

    sendAckReqOnConn(conn);
  }


  function endDataHandling() {
    stopAckTimeout();
    conn.end();
  }


  function sendAckReqOnConn() {

    var id = utils.int2hex(currentIteration);
    var crc = utils.checksum("40" + id);

    var msg = "1040" + id + crc + "16";

    console.log('Id' + currentIteration +' sending Ack request. Sending: ' + msg);

    conn.write(msg, "hex");
    startAckTimeout();
  }


  function sendMsgReqOnConn() {
    var id = utils.int2hex(currentIteration);
    var crc = utils.checksum("7B" + id);

    conn.write("107B" + id + crc + "16", "hex");
  }


  function startAckTimeout(){
    timeoutAck = setTimeout(function () {
      console.log('Id' + currentIteration + ' on timeout!');
      nextDataIteration();
    },  ACK_TIMEOUT);
  }

  function stopAckTimeout(){
      clearTimeout(timeoutAck);
  }
  /*
  function startMsgTimeout(){
    timeoutMsg = setTimeout(function () {
      console.log('Id' + currentIteration + ' repeat message request');
      sendMsgReqOnConn(conn);
    },  MSG_TIMEOUT);
  }

  function stopMsgTimeout(){
      clearTimeout(timeoutMsg);
  }
  */
}
