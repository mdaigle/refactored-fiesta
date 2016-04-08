const assert = require('assert');
const protocol = require('./protocol');

// Strip process name and assert that we were passed enough arguments.
const args = process.argv.slice(2);
assert(args.length == 2);

// Create a session id to use for all communications with the server.
const SESSIONID = protocol.makeSessionId();
console.log("New session with id %d", SESSIONID);

// Create a socket to communicate with the server.
const DGRAM = require('dgram');
const SOCKET = DGRAM.createSocket('udp4');

// Set a timeout of 20 seconds.
//var timer = setTimeout(/*timeout callback*/, 20000)

var message = protocol.newMessage(protocol.HELLO, 1, SESSIONID);
var buf = protocol.encodeMessage(message);

// Client state constants.
const HELLOWAIT = 0;
const READY = 1;
const READYTIMER = 2;
const CLOSING = 3;
const CLOSED = 4;

var clientstate = -1;

//Send initial HELLO message to server, then enter HELLOWAIT state
/*SOCKET.send(msg, args[1], args[0], (err) => {
	SOCKET.close();
});*/
clientstate = HELLOWAIT;

// SOCKET EVENT BINDINGS
// -------------------------------------------------------------------------- //
SOCKET.on('message', (msg, rinfo) => {
	console.log('Received %d bytes from %s:%d\n', 
		msg.length, rinfo.address, rinfo.port);
	//processmessage(msg, rinfo);
	switch(clientstate) {
		case HELLOWAIT:
		//make sure its a HELLO message
		case READY:
		//make sure its a ALIVE message
		case READYTIMER:
		//make sure its a ALIVE message
		case CLOSING:
		//make sure its either ALIVE or GOODBYE
	}
});

// IO and IO EVENT BINDINGS
// -------------------------------------------------------------------------- //
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

rl.on('line', (line) => {
	//check connection state
	//break apart if too long and send to server with header.
});

rl.on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});

// TIMER CALLBACK
// -------------------------------------------------------------------------- //
function timeout() {
	// if not closing, set to closing
	// if closing, set to closed
	// send GOODBYE message
}
