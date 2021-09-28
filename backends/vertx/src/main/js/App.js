var Router = require("vertx-web-js/router");
var SockJSHandler = require("vertx-web-js/sock_js_handler");
var BodyHandler = require("vertx-web-js/body_handler");
var StaticHandler = require("vertx-web-js/static_handler");

var router = Router.router(vertx);

var connections = {}

var eb = vertx.eventBus();

eb.consumer("user.connect").handler(function(message) {
  console.log('message', message)
  eb.publish("user.connected", JSON.stringify(message));
}).exceptionHandler(function(error) {
  console.log(error);
});

eb.consumer("user.messageIn").handler(function(message) {
  eb.publish("user.messageOut", message.body);
}).exceptionHandler(function(error) {
  console.log(error);
});

var options = {
  "heartbeatInterval" : 2000,
  "sessionTimeout" : 6000
};

var sockJSHandler = SockJSHandler.create(vertx, options);

var inboundPermitted1 = {
  "address" : "user.connect"
};
var inboundPermitted2 = {
  "address" : "user.messageIn"
};

var outboundPermitted1 = {
  "address" : "user.messageOut"
};
var outboundPermitted2 = {
  "address" : "user.connected"
};

var bridgeOptions = {
  "inboundPermitteds" : [
    inboundPermitted1,
    inboundPermitted2
  ],
  "outboundPermitteds" : [
    outboundPermitted1,
    outboundPermitted2
  ]
};

function bridgeEventHandler (be) {
  var connectionID = be.socket().writeHandlerID();
  if (be.type() === "SEND" && be.getRawMessage().address === "user.connect") {
    var body = be.getRawMessage().body;
    console.log(connections);
    var user = new User();
    user.setConnectionID(connectionID);
    user.setUserName(body["username"]);
    user.setCanVibrate(body["canVibrate"]);
    connections[connectionID] = user;
    console.log(be.getRawMessage());
  } else if (be.type() === "RECEIVE" && be.getRawMessage().address === "user.connected") {
    var users = [];
    for (user_ in connections.keys()) {
      users.push(connections[user_]);
    }
    var payload = {};
    payload["connectionID"] = connectionID;
    payload["users"] = users;
    var response = be.getRawMessage();
    response["body"] = payload;
    be.setRawMessage(response);
    console.log(be.getRawMessage());
  } else if (be.type() === "RECEIVE" && be.getRawMessage().address === "user.messageOut") {
    var recipientString = be.getRawMessage().body.recipientID;
    var recipient = connections[recipientString];
    if (recipient == null || !connectionID.equals(recipient.getConnectionID())) {
        be.complete(false);
        return;
    }
    console.log(be.getRawMessage());
  } else if (be.type() == "SOCKET_CLOSED") {
    delete connections[connectionID];
    eb.publish("user.connected", null);
  }
  be.complete(true);
}

var sockJSRoute = router.mountSubRouter("/eventbus", sockJSHandler.bridge(bridgeOptions, bridgeEventHandler));

sockJSRoute.exceptionHandler(function(error) {
  console.log(error);
});

router.route().handler(BodyHandler.create().handle);
var staticHandler = StaticHandler.create();
staticHandler.setWebRoot("src/main/resources/webroot");
router.route().handler(staticHandler.handle);

vertx.createHttpServer()
  .requestHandler(router.handle)
  .listen(8080);


var User = function() {
  this.connectionID;
  this.username;
  this.canVibrate;
}

User.prototype.getConnectionID = function() {
  return this.connectionID;
}
User.prototype.setConnectionID = function(id) {
  this.connectionID = id;
}
User.prototype.getUserName = function() {
  return this.username;
}
User.prototype.setUserName = function(name) {
  this.username = name;
}
User.prototype.getCanVibrate = function() {
  return this.canVibrate;
}
User.prototype.setCanVibrate = function(canVibrate) {
  this.canVibrate = canVibrate;
}