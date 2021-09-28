package veebrate

import io.vertx.core.AbstractVerticle
import io.vertx.ext.web.Router
import io.vertx.core.eventbus.EventBus
import io.vertx.core.Promise
import io.vertx.ext.web.handler.BodyHandler
import io.vertx.ext.web.handler.StaticHandler
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions
import io.vertx.ext.web.handler.sockjs.SockJSHandler
import io.vertx.core.json.JsonObject
import io.vertx.kotlin.core.json.json
import io.vertx.kotlin.core.json.obj
import io.vertx.kotlin.core.json.array
import io.vertx.ext.bridge.PermittedOptions
import io.vertx.ext.web.handler.sockjs.BridgeOptions
import io.vertx.ext.bridge.BridgeEventType
import io.vertx.ext.web.handler.sockjs.BridgeEvent

class App : AbstractVerticle() {
    private var connections: MutableMap<String, User> = HashMap<String, User>()
    override fun start(promise: Promise<Void>) {
        val router: Router = Router.router(vertx)

        val eb: EventBus = vertx.eventBus()
        eb.consumer<Any>("user.connect").handler({ message -> eb.publish("user.connected", message.body()) })
                .exceptionHandler(io.vertx.core.Handler({ error: Throwable -> println(error.message) }))
        eb.consumer<Any>("user.messageIn").handler({ message -> eb.publish("user.messageOut", message.body()) })
                .exceptionHandler(io.vertx.core.Handler({ error: Throwable -> println(error.message) }))
        val options = SockJSHandlerOptions()
        options.setHeartbeatInterval(2000)
        options.setSessionTimeout(6000)
        val sockJSHandler: SockJSHandler = SockJSHandler.create(vertx, options)

        val bridgeOptions: BridgeOptions = BridgeOptions()
                .addInboundPermitted(PermittedOptions().setAddress("user.messageIn"))
                .addInboundPermitted(PermittedOptions().setAddress("user.connect"))
                .addOutboundPermitted(PermittedOptions().setAddress("user.messageOut"))
                .addOutboundPermitted(PermittedOptions().setAddress("user.connected"))

        val bridgeEventHandler = fun(be: BridgeEvent) {
            val connectionID: String = be.socket().writeHandlerID()
            if (be.type() == BridgeEventType.SEND && be.getRawMessage().getString("address") == "user.connect") {
                val body: JsonObject = be.getRawMessage().getJsonObject("body")
                val user = User(connectionID, body.getString("userName"), body.getBoolean("canVibrate"))
                connections[connectionID] = user
            } else if (be.type() == BridgeEventType.RECEIVE && be.getRawMessage().getString("address") == "user.connected") {

                val payload = json {
                    obj(
                        "connectionID" to connectionID,
                        "users" to array {
                            for ((_, conn) in connections) {
                                val (connectionID_, userName, canVibrate) = conn
                                add(
                                    obj(
                                        "connectionID" to connectionID_,
                                        "userName" to userName,
                                        "canVibrate" to canVibrate
                                    )
                                )
                            }
                        }
                    )
                }
                val response: JsonObject = be.getRawMessage()
                response.put("body", payload)
                be.setRawMessage(response)
            } else if (be.type() == BridgeEventType.RECEIVE && be.getRawMessage().getString("address") == "user.messageOut") {
                val recipientString: String = be.getRawMessage().getJsonObject("body").getString("recipientID")
                val recipient = connections[recipientString]
                if (recipient == null || connectionID != recipient.connectionID) {
                    be.complete(false)
                    return
                }
            } else if (be.type() == BridgeEventType.SOCKET_CLOSED) {
                connections.remove(connectionID)
                eb.publish("user.connected", null)
            }
            be.complete(true)
        }
        router.mountSubRouter("/eventbus", sockJSHandler
                .bridge(bridgeOptions, bridgeEventHandler))
        router.route().handler(BodyHandler.create())
        // val staticHandler = StaticHandler.create("webroot")
        val staticHandler = StaticHandler.create("src/main/resources/webroot")
        router.route().handler(staticHandler)
        val port: Int = java.lang.Integer.getInteger("http.port", 8080)
        val httpAddress: String = java.lang.System.getProperty("http.address", "0.0.0.0")
        vertx.createHttpServer()
            .requestHandler(router)
            .exceptionHandler({ error: Throwable -> println(error.message) })
            .listen(port, httpAddress, { result ->
                if (result.succeeded()) {
                    promise.complete()
                } else {
                    promise.fail(result.cause())
                }
            })
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            io.vertx.core.Launcher.executeCommand("run", App::class.java.getName())
        }
    }
}

data class User(
    val connectionID: String,
    var userName: String,
    var canVibrate: Boolean
)