from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.veebrate.consumers import VeebrateConsumer


application = ProtocolTypeRouter({
    # WebSocket chat handler

    "websocket": URLRouter([
        path("websocket", VeebrateConsumer),
    ]),
})
