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

// Encodes a p0p message with fields magic, version, command, sequence number, 
// and session id.
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

// Returns a random 32 bit unsigned int to use as a session id.
module.exports.makeSessionId = makeSessionId;
function makeSessionId() {
	return Math.floor(Math.random() * (Math.pow(2, 32) - 1));
}