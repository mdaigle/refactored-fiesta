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
module.exports.messageEncode = messageEncode;
function messageEncode(msg) {
	var msgarr = [];

	var endianness = os.endianness();
	if (endianness == "BE") {
		//just push everything onto the array.
		//msgarr.push(msg.magic)
	} else {
		//reverse order of bytes for each component
	}
	
	return msgarr;
}

// Returns a random 32 bit unsigned int to use as a session id.
module.exports.makeSessionId = makeSessionId;
function makeSessionId() {
	return Math.floor(Math.random() * (Math.pow(2, 32) - 1));
}