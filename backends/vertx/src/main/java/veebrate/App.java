package veebrate;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Launcher;
import io.vertx.core.Promise;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.core.eventbus.EventBus;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.BridgeEvent;
import io.vertx.ext.bridge.PermittedOptions;

import java.util.HashMap;
import java.util.Map;
import java.util.Collection;

public class App extends AbstractVerticle {

    private Map<String,User> connections = new HashMap<>();

    public static void main(String[] args) {
        Launcher.executeCommand("run", App.class.getName());
    }

    @Override
    public void start(Promise<Void> promise) {

        Router router = Router.router(vertx);
        
        EventBus eb = vertx.eventBus();

        eb.consumer("user.connect").handler(message -> {
            eb.publish("user.connected", message.body());
        })
        .exceptionHandler(error -> {
            System.out.println(error.getMessage());
        });
        // Register to listen for messages coming IN to the server
        eb.consumer("user.messageIn").handler(message -> {
            eb.publish("user.messageOut", message.body());
        })
        .exceptionHandler(error -> {
            System.out.println(error.getMessage());
        });

        SockJSHandlerOptions options = new SockJSHandlerOptions();
        options.setHeartbeatInterval(2000);
        options.setSessionTimeout(6000);

        SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);

        BridgeOptions bridgeOptions = new BridgeOptions()
        .addInboundPermitted(new PermittedOptions().setAddress("user.messageIn"))
        .addInboundPermitted(new PermittedOptions().setAddress("user.connect"))
        .addOutboundPermitted(new PermittedOptions().setAddress("user.messageOut"))
        .addOutboundPermitted(new PermittedOptions().setAddress("user.connected"));

        Handler<BridgeEvent> bridgeEventHandler = be -> {     
            String connectionID = be.socket().writeHandlerID();
            if (be.type() == BridgeEventType.SEND && be.getRawMessage().getString("address").equals("user.connect")) {
                JsonObject body = be.getRawMessage().getJsonObject("body");
                User user = new User();
                user.setConnectionID(connectionID);
                user.setUserName(body.getString("userName"));
                user.setCanVibrate(body.getBoolean("canVibrate"));
                connections.put(connectionID, user);
            } else if (be.type() == BridgeEventType.RECEIVE && be.getRawMessage().getString("address").equals("user.connected")) {
                JsonArray users = new JsonArray();
                Collection<User> collectionConns = connections.values();
                for (User user_ : collectionConns) {
                    users.add(
                        new JsonObject()
                            .put("connectionID", user_.getConnectionID())
                            .put("userName", user_.getUserName())
                            .put("canVibrate", user_.getCanVibrate())
                    );
                }
                JsonObject payload = new JsonObject();
                payload.put("connectionID", connectionID);
                payload.put("users", users);
                JsonObject response = be.getRawMessage();
                response.put("body", payload);
                be.setRawMessage(response);
            } else if (be.type() == BridgeEventType.RECEIVE && be.getRawMessage().getString("address").equals("user.messageOut")) {
                String recipientString = be.getRawMessage().getJsonObject("body").getString("recipientID");
                User recipient = connections.get(recipientString);
                if (recipient == null || !connectionID.equals(recipient.getConnectionID())) {
                    be.complete(false);
                    return;
                }
            } else if (be.type() == BridgeEventType.SOCKET_CLOSED) {
                connections.remove(connectionID);
                eb.publish("user.connected", null);
            }
            be.complete(true);
        };

        router.mountSubRouter("/eventbus", sockJSHandler
            .bridge(bridgeOptions, bridgeEventHandler))
            .errorHandler(500, error -> {
                System.out.println(error);
            });

        router.route().handler(BodyHandler.create());
        // StaticHandler staticHandler = StaticHandler.create("webroot");
        StaticHandler staticHandler = StaticHandler.create("src/main/resources/webroot");

        router.route().handler(staticHandler);
        int port = Integer.getInteger("http.port", 8080);
        String httpAddress = System.getProperty("http.address", "0.0.0.0");
        vertx.createHttpServer()
            .requestHandler(router)
            .exceptionHandler(error -> {
                System.out.println(error.getMessage());
            })
            .listen(port, httpAddress, result -> {
                if (result.succeeded()) {
                    promise.complete();
                } else {
                    promise.fail(result.cause());
                }
            });
    }

    private class User {
        private String connectionID;
        private String userName;
        private boolean canVibrate;

        public User(){
        }
        public String getConnectionID() {
            return connectionID;
        }
        public void setConnectionID(String id) {
            this.connectionID = id;
        }
        public String getUserName() {
            return userName;
        }
        public void setUserName(String name) {
            this.userName = name;
        }
        public boolean getCanVibrate() {
            return canVibrate;
        }
        public void setCanVibrate(boolean canVibrate) {
            this.canVibrate = canVibrate;
        }
    }
}
