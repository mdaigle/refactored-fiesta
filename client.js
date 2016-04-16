const assert = require('assert');
const protocol = require('./protocol');
const dns = require('dns');

// Strip process name and assert that we were passed enough arguments.
const args = process.argv.slice(2);
assert(args.length == 2);

var clientstate = -1;

var addr;
dns.lookup(args[0], (err, address, family) => {
	if (err) { 
		console.log("error resolving addr");
		process.exit(0);
	}

	addr = address;

  //Send initial HELLO message to server, then enter HELLOWAIT state
	sendMsg(protocol.HELLO, null);

	clientstate = HELLOWAIT;

	var timer = setTimeout(function() {
		timeout("waiting for hello");
	}, 5000);
});

// Create a socket to communicate with the server.
const DGRAM = require('dgram');
const SOCKET = DGRAM.createSocket('udp4');

// Create a session id to use for all communications with the server.
const SESSIONID = protocol.makeSessionId();
//console.log("New session with id %d", SESSIONID);

// Sequence number, incremented for each message sent.
var client_seq_num = 0;
var server_seq_num = -1;

// Client state constants.
const HELLOWAIT = 0;
const READY = 1;
const READYTIMER = 2;
const CLOSING = 3;
const CLOSED = 4;

// SOCKET EVENT BINDINGS
// -------------------------------------------------------------------------- //
SOCKET.on('message', (buf, rinfo) => {
	/*console.log('Received %d bytes from %s:%d\n', 
		buf.length, rinfo.address, rinfo.port);*/
	var message = protocol.decodeMessage(buf, rinfo);

	// Validate message
	if (message.magic != protocol.MAGIC) {
		//console.log("magic value was bad", message.magic, protocol.MAGIC);
		return;
	}

	// If the message is a GOODBYE, exit immediately, no matter the current 
	// state
	if (message.command == protocol.GOODBYE) {
		SOCKET.close();
		process.exit(0);
	}

	if (message.sequence_number < server_seq_num) {
		//protocol error
		SOCKET.close();
		process.exit(1);
	}

	if (message.sequence_number == server_seq_num) {
		//duplicate message, discard
		return;
	}

	server_seq_num = message.sequence_number;

	switch(clientstate) {
		case HELLOWAIT:
			if (message.command != protocol.HELLO) {
				SOCKET.close();
				process.exit(1);
			}
			clearTimeout(timer);
			clientstate = READY;
			rl.resume();
			break;
		case READY:
			break;
		case READYTIMER:
			if (message.command != protocol.ALIVE) {
				SOCKET.close();
				process.exit(1);
			}
			clearTimeout(timer);
			clientstate = READY;
			//console.log("received message in READYTIMER state");
			break;
		case CLOSING:
			if (message.command != protocol.ALIVE) {
				SOCKET.close();
				process.exit(1);
			}
	}
});

// IO and IO EVENT BINDINGS
// -------------------------------------------------------------------------- //
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
rl.pause();

rl.on('line', (line) => {
	if (clientstate != READY && clientstate != READYTIMER) {
		return;
	}

	if (line == "q") {
		sendMsg(protocol.GOODBYE, null);
		clientstate = CLOSING;
		clearTimeout(timer);
		timer = setTimeout(function() {
			timeout("waiting for goodbye");
		}, 5000);
		return;
	}

	while (line.length > protocol.MAX_DATA_SIZE) {
		var payload = line.substr(0, protocol.MAX_DATA_SIZE);
		line = line.substring(protocol.MAX_DATA_SIZE);
		sendMsg(protocol.DATA, payload);
	}

	// line now guaranteed to be an acceptable length
	sendMsg(protocol.DATA, line);

	if (clientstate == READY) {
		clientstate = READYTIMER;
		clearTimeout(timer);
		timer = setTimeout(function() {
			timeout("waiting for alive");
		}, 5000);
	}
});

rl.on('close', () => {
	sendMsg(protocol.GOODBYE, null);
	clientstate = CLOSING;
	clearTimeout(timer);
	timer = setTimeout(function() {
		timeout("waiting for goodbye");
	}, 5000);
});

// payload must be less than or equal to protocol.MAX_DATA_SIZE bytes.
function sendMsg(command, payload) {
	var message = protocol.newMessage(command, client_seq_num++, SESSIONID);
	if (payload != null) {
		message.payload = payload;
	}
	var buf = protocol.encodeMessage(message);
	SOCKET.send(buf, 0, buf.length, args[1], addr);
}

// TIMER CALLBACK
// -------------------------------------------------------------------------- //
function timeout(src) {
	//console.log("timeout from", src);
	if (clientstate == CLOSING) {
		SOCKET.close();
		process.exit(1);
	}

	sendMsg(protocol.GOODBYE, null);
	clientstate = CLOSING;

	clearTimeout(timer);
	timer = setTimeout(function() {
		timeout("from timer, waiting for goodbye");
	}, 5000);
	return;
}
