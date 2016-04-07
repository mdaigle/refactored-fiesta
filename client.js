var args = process.argv.slice(2);

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

//Send HELLO message to server
socket.send(msg, args[1], args[0], (err) => {
	socket.close();
})

socket.on('message', (msg, rinfo) => {
	console.log('Received %d bytes from %s:%d\n', 
		msg.length, rinfo.address, rinfo.port);
	//processmessage(msg, rinfo);
});
