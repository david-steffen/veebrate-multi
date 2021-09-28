use actix::{Actor, StreamHandler};
use actix_web::{get, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use actix_files as fs;
use uuid::Uuid;
use actix_web::middleware::Logger;
use env_logger::Env;


const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);



/// Define http actor
struct VeebrateWs {
    id: Uuid,
    userName: Option<String>,
    hb: Instant,
}

impl Actor for VeebrateWs {
    type Context = ws::WebsocketContext<Self>;
}

/// Handler for ws::Message message
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for VeebrateWs {
    fn handle(
        &mut self,
        msg: Result<ws::Message, ws::ProtocolError>,
        ctx: &mut Self::Context,
    ) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };
        println!("WEBSOCKET MESSAGE: {:?}", msg);
        match msg {
            ws::Message::Ping(msg) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(_) => {
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => (),
            ws::Message::Binary(bin) => ctx.binary(bin),
            _ => (),
        }
    }
}

impl VeebrateWs {
    /// helper method that sends ping to client every second.
    ///
    /// also this method checks heartbeats from client
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // notify chat server
                act.addr.do_send(server::Disconnect { id: act.id });

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");
        });
    }
}

#[get("/websocket")]
async fn websocket(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(VeebrateWs {
        id: Uuid::new_v4(),
        userName: None,
        hb: Instant::now(),
    }, &req, stream);
    println!("{:?}", resp);
    resp
}


#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    env_logger::from_env(Env::default().default_filter_or("info")).init();

    HttpServer::new(||
        App::new()
        .service(fs::Files::new("/", "./static/").index_file("index.html"))
        .service(websocket)
        .wrap(Logger::default())
        )
    .bind("127.0.0.1:8000")?
    .run()
    .await
}
