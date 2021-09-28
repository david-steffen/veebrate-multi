from django.db import models


# Create your models here.
class WebSocketUser(models.Model):
    connection_id = models.TextField(primary_key=True)
    username = models.TextField()
    can_vibrate = models.BooleanField()
