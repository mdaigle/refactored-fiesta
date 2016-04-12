const assert = require('assert');
const protocol = require('./protocol');

// Strip process name and assert that we were passed enough arguments.
const args = process.argv.slice(2);
assert(args.length == 2);

// Create a socket to communicate with the server.
const DGRAM = require('dgram');
const SOCKET = DGRAM.createSocket('udp4');

// Create a session id to use for all communications with the server.
const SESSIONID = protocol.makeSessionId();
console.log("New session with id %d", SESSIONID);

// Sequence number, incremented for each message sent.
var seq_num = 0;

// Set a timeout of 20 seconds.
//var timer = setTimeout(/*timeout callback*/, 20000)

var message = protocol.newMessage(protocol.HELLO, 0, SESSIONID);
var buf = protocol.encodeMessage(message);

// Client state constants.
const HELLOWAIT = 0;
const READY = 1;
const READYTIMER = 2;
const CLOSING = 3;
const CLOSED = 4;

var clientstate = -1;

//Send initial HELLO message to server, then enter HELLOWAIT state
SOCKET.send(buf, args[1], args[0], (err) => {
	console.log("sent hello message")
});

clientstate = HELLOWAIT;

// SOCKET EVENT BINDINGS
// -------------------------------------------------------------------------- //
SOCKET.on('message', (buf, rinfo) => {
	console.log('Received %d bytes from %s:%d\n', 
		buf.length, rinfo.address, rinfo.port);
	var message = decodeMessage(buf, rinfo);

	// Validate message
	if (message.magic != protocol.MAGIC) {
		return;
	}

	// If the message is a GOODBYE, exit immediately
	if (message.command == protocol.GOODBYE) {
		process.exit(0);
	}

	switch(clientstate) {
		case HELLOWAIT:
			if (message.command != protocol.HELLO) {
				//ERROR we received something before an initial HELLO response
				// quit
				process.exit(1);
			}
			clientstate = READY;
			//TODO: cancel timer
			break;
		case READY:
			break;
		case READYTIMER:
			if (message.command != protocol.ALIVE) {
				process.exit(1);
			}
			clientstate = READY;
			//TODO: cancel timer
			break;
		case CLOSING:
			if (message.command != protocol.ALIVE) {
				process.exit(1);
			}
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
