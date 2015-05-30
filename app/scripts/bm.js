var messages = require("bitmessage").messages;
var TcpTransport = require("bitmessage-transports").TcpTransport;

var tcp = new TcpTransport({
  dnsSeeds: [["bootstrap8444.bitmessage.org", 8444]],
});

tcp.bootstrap().then(function(nodes) {
  var remoteHost = nodes[0][0];
  var remotePort = nodes[0][1];
  console.log("Connecting to", nodes[0]);
  tcp.connect(remotePort, remoteHost);
});

tcp.on("established", function(version) {
  console.log("Connection established to", version.userAgent);

  tcp.on("message", function(command, payload) {
    console.log("Got new", command, "message");
    var decoded;
    if (command === "addr") {
      decoded = messages.addr.decodePayload(payload);
      console.log("Got", decoded.addrs.length, "node addresses");
    }
  });
});

module.exports = {
    messages: messages,
    tcp: TcpTransport
};
