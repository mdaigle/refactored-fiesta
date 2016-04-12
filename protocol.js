/*
	a p0p message is a structure with fields magic (uint16), version (uint8), 
	command (uint8), sequence number (uint32), session id (uint32), and data 
	(array of bytes).
*/

// Protocol state constants.
const HELLO = 0;
const DATA = 1;
const ALIVE = 2;
const GOODBYE = 3;

// Protocol header constants.
const MAGIC = 0xC461;
const VERSION = 1;

module.exports.newMessage = newMessage;
function newMessage(command_, sequence_number_, session_id_) {
	var msg = {
		magic: MAGIC,
		version: VERSION,
		command: command_,
		sequence_number: sequence_number_,
		session_id: session_id_
	};
	return msg;
}

// Encodes a p0p message.
module.exports.encodeMessage = encodeMessage;
function encodeMessage(msg) {
	//TODO: correct buffer size?
	var buf = new Buffer(512);

	buf.writeUInt16BE(msg.magic, 0);
	buf.writeUInt8(msg.version, 2);
	buf.writeUInt8(msg.command, 3);
	buf.writeUInt32BE(msg.sequence_number, 4);
	buf.writeUInt32BE(msg.session_id, 8);

	//TODO: Change hard-coded 12 to account for length of data
	var trimmed = buf.slice(0, 12)
	console.log(trimmed);
	return buf;
}

// Decodes a p0p message.
module.exports.decodeMessage = decodeMessage;
function decodeMessage(buf_arr) {
	var buf = new Buffer(buf_arr);
	var msg = {
		magic: buf.readUInt16BE(0),
		version: buf.readUInt8(2),
		command: buf.readUInt8(3),
		sequence_number: buf.readUInt32BE(4),
		session_id: buf.readUInt32BE(8)
	};
	return msg;
}

// Returns a random 32 bit unsigned int to use as a session id.
module.exports.makeSessionId = makeSessionId;
function makeSessionId() {
	return Math.floor(Math.random() * (Math.pow(2, 32) - 1));
}