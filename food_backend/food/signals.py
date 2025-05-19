from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from .models import Review

@receiver([post_save, post_delete], sender=Review)
def update_product_rating(sender, instance, **kwargs):
    product = instance.product
    reviews = product.reviews.all()
    avg = reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'] or 0
    product.average_rating = round(avg, 2)
    product.save()
