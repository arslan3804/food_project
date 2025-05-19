from rest_framework import serializers
from djoser.serializers import UserSerializer
from drf_extra_fields.fields import Base64ImageField
from food.models import (
    CustomUser, Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, Review, PromoCode
)
from decimal import Decimal


class CustomUserSerializer(UserSerializer):
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta(UserSerializer.Meta):
        model = CustomUser
        fields = UserSerializer.Meta.fields + ('address', "first_name", "last_name")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class ProductImageSerializer(serializers.ModelSerializer):
    image = Base64ImageField()
    product = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=Product.objects.all()
    )

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'product')


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field='slug', 
        queryset=Category.objects.all(), 
        required=False,
        allow_null=True
    )

    category_detail = CategorySerializer(source='category', read_only=True)
    
    images = ProductImageSerializer(many=True, read_only=True)
    
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'price', 'is_available',
            'category', 'category_detail', 'images', 'created_at',
            'average_rating'
        )
        read_only_fields = ('created_at',)


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ('code', 'discount_percent', 'expires_at')
        read_only_fields = fields


class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=Product.objects.all()
    )
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_detail', 'quantity')


class CartSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    promo_code = PromoCodeSerializer(read_only=True)
    total = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = (
            'id', 'user', 'items', 'promo_code', 
            'discount_amount', 'subtotal', 'total', 'created_at'
        )
        read_only_fields = ('created_at',)

    def get_subtotal(self, obj):
        return sum(
            item.product.price * item.quantity 
            for item in obj.items.all()
        )

    def get_discount_amount(self, obj):
        subtotal = self.get_subtotal(obj)
        if obj.promo_code:
            discount_percent = Decimal(obj.promo_code.discount_percent) / Decimal(100)
            return (subtotal * discount_percent).quantize(Decimal('0.01'))
        return Decimal('0.00')

    def get_total(self, obj):
        subtotal = self.get_subtotal(obj)
        discount = self.get_discount_amount(obj)
        return (subtotal - discount).quantize(Decimal('0.01'))


class AddToCartSerializer(serializers.Serializer):
    product = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Product.objects.all()
    )

    def save(self):
        user = self.context['request'].user
        product = self.validated_data['product']

        cart, _ = Cart.objects.get_or_create(user=user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return cart_item



class DecreaseCartItemSerializer(serializers.Serializer):
    product = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Product.objects.all()
    )

    def save(self):
        user = self.context['request'].user
        product = self.validated_data['product']

        try:
            cart = Cart.objects.get(user=user)
            cart_item = CartItem.objects.get(cart=cart, product=product)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            raise serializers.ValidationError("Продукт отсутствует в корзине")

        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()

        return cart_item


class RemoveCartItemSerializer(serializers.Serializer):
    product = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Product.objects.all()
    )

    def save(self):
        user = self.context['request'].user
        product = self.validated_data['product']

        try:
            cart = Cart.objects.get(user=user)
            cart_item = CartItem.objects.get(cart=cart, product=product)
            cart_item.delete()
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            raise serializers.ValidationError("Продукт отсутствует в корзине")

        return { "removed": True }


class ClearCartSerializer(serializers.Serializer):
    def save(self):
        user = self.context['request'].user

        try:
            cart = Cart.objects.get(user=user)
            cart.items.all().delete()
        except Cart.DoesNotExist:
            pass

        return { "cleared": True }


class ApplyPromoCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20)

    def validate_code(self, value):
        try:
            promo = PromoCode.objects.get(code=value)
            if not promo.is_usable(self.context['request'].user):
                raise serializers.ValidationError("Промокод недействителен или уже использован")
            return promo
        except PromoCode.DoesNotExist:
            raise serializers.ValidationError("Промокод не найден")


class RemovePromoCodeSerializer(serializers.Serializer):
    pass


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Product.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price_per_item')


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    promo_code = PromoCodeSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'delivery_address',
            'created_at', 'total_price',
            'items', 'promo_code'
        )
        read_only_fields = ('created_at',)


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(
        slug_field='username', read_only=True
    )

    class Meta:
        model = Review
        fields = ('id', 'user', 'rating', 'text', 'created_at')
        read_only_fields = ('user', 'created_at')


