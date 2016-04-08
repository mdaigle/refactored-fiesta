var protocol = require('./protocol');

var args = process.argv.slice(2);

const SESSIONID = protocol.makeSessionId();
console.log("New session with id %d", SESSIONID);

const DGRAM = require('dgram');
const SOCKET = DGRAM.createSocket('udp4');

//Send HELLO message to server
/*SOCKET.send(msg, args[1], args[0], (err) => {
	SOCKET.close();
});*/

SOCKET.on('message', (msg, rinfo) => {
	console.log('Received %d bytes from %s:%d\n', 
		msg.length, rinfo.address, rinfo.port);
	//processmessage(msg, rinfo);
});

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