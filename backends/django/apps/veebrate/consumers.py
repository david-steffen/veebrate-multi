from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from apps.veebrate.models import WebSocketUser


class VeebrateConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        await self.channel_layer.group_add(
            'main',
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'main',
            self.channel_name
        )
        await self.remove_user()

    # Receive message from WebSocket
    async def receive_json(self, json_data):
        message = json_data['message']
        type_ = json_data['type']

        if type_ == 'user_connect':
            await self.create_user(message)
            usersList = await self.get_user_list()
            await self.channel_layer.group_send(
                'main',
                {
                    'type': 'user_connected',
                    'message': {
                        'users': usersList
                    }

                }
            )
        elif type_ == 'user_messageIn':
            await self.channel_layer.group_send(
                'main',
                {
                    'type': 'user_messageOut',
                    'message': message
                }
            )

    # Receive message from room group
    async def user_connected(self, event):
        # Send message to WebSocket
        event['message']['connectionID'] = self.channel_name
        await self.send_json(event)

    # Receive message from room group
    async def user_messageOut(self, event):
        message = event['message']
        if message['recipientID'] == self.channel_name:
            # Send message to WebSocket
            await self.send_json(event)

    @database_sync_to_async
    def create_user(self, message):
        return WebSocketUser.objects.create(
            connection_id=self.channel_name,
            username=message['userName'],
            can_vibrate=message['canVibrate'],
        )

    @database_sync_to_async
    def remove_user(self):
        return WebSocketUser.objects.get(
            connection_id=self.channel_name
        ).delete()

    @database_sync_to_async
    def get_user_list(self):
        usersList = WebSocketUser.objects.all()
        return list(map(self.format_user_dict, usersList))

    def format_user_dict(self, user):
        return {
            'connectionID': user.connection_id,
            'userName': user.username,
            'canVibrate': user.can_vibrate
        }
