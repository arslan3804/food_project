from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import random


class CustomUser(AbstractUser):
    address = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.username


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)
    average_rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return f"Картинка {self.product.name}"


class PromoCode(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='promo_codes')
    code = models.CharField(max_length=20, unique=True)
    discount_percent = models.PositiveIntegerField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} ({self.discount_percent}%) для {self.user.username}"
    
    @classmethod
    def generate_code(cls):
        """Генерация случайного кода"""
        chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        return ''.join(random.choice(chars) for _ in range(8))
    
    @classmethod
    def create_daily_promo(cls, user):
        last_promo = cls.objects.filter(user=user).order_by('-created_at').first()

        if last_promo and last_promo.created_at.date() == timezone.now().date():
            return last_promo

        if random.random() < 0.3:
            zero_promo = cls.objects.create(
                user=user,
                code=cls.generate_code(),
                discount_percent=0,
                is_used=True,
                expires_at=timezone.now() + timedelta(days=1)
            )
            return zero_promo


        discount_choices = [5, 7, 8, 10, 12, 15]
        weights = [40, 25, 15, 10, 7, 3]

        discount = random.choices(discount_choices, weights=weights, k=1)[0]

        promo = cls.objects.create(
            user=user,
            code=cls.generate_code(),
            discount_percent=discount,
            expires_at=timezone.now() + timedelta(days=1)
        )
        return promo

    def is_usable(self, user):
        return (
            self.user == user and
            not self.is_used and
            timezone.now() < self.expires_at
        )

    def mark_as_used(self):
        self.is_used = True
        self.save()


class Cart(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='applied_to_carts'
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0
    )

    def __str__(self):
        return f"Корзина пользователя {self.user.username}"
    
    def calculate_total(self):
        subtotal = sum(
            item.product.price * item.quantity 
            for item in self.items.all()
        )
        total = subtotal - self.discount_amount
        return total

    def apply_promo_code(self, promo_code):
        if not promo_code.is_usable(self.user):
            return False
        
        subtotal = sum(
            item.product.price * item.quantity 
            for item in self.items.all()
        )
        
        self.discount_amount = subtotal * promo_code.discount_percent / 100
        self.promo_code = promo_code
        self.save()
        return True

    def clear_promo_code(self):
        self.promo_code = None
        self.discount_amount = 0
        self.save()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Order(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='orders')
    delivery_address = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )

    def __str__(self):
        return f"Заказ #{self.id} пользователя {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        product_name = self.product.name if self.product else "Продукт удален"
        return f"{self.quantity} x {product_name}"

class Review(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.rating}★ от {self.user.username} на {self.product.name}"
