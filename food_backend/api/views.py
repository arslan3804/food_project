from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, mixins, filters
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from food.models import Category, Cart, Product, ProductImage, Order, OrderItem, PromoCode
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductImageSerializer,
    CartSerializer,
    AddToCartSerializer,
    DecreaseCartItemSerializer,
    RemoveCartItemSerializer,
    ClearCartSerializer,
    ApplyPromoCodeSerializer,
    RemovePromoCodeSerializer,
    OrderSerializer,
    ReviewSerializer,
    PromoCodeSerializer
)
from .permissions import AdminOnlyCreateUpdateDelete


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (AdminOnlyCreateUpdateDelete,)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = (AdminOnlyCreateUpdateDelete,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ['category', 'is_available']
    search_fields = ['name']

    @action(detail=False, url_path='category/(?P<slug>[\w-]+)', methods=['get'])
    def by_category_slug(self, request, slug=None):
        category = get_object_or_404(Category, slug=slug)
        products = Product.objects.filter(category=category)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = (AdminOnlyCreateUpdateDelete,)


class CartItemViewSet(viewsets.GenericViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = CartSerializer
    
    def get_cart(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        serializer = AddToCartSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        cart_item = serializer.save()
        return Response({
            "id": cart_item.id,
            "product": cart_item.product.name,
            "quantity": cart_item.quantity,
        })

    @action(detail=False, methods=['post'])
    def decrease(self, request):
        serializer = DecreaseCartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        cart_item = serializer.save()
        return Response({
            "id": cart_item.id,
            "product": cart_item.product.name,
            "quantity": cart_item.quantity,
        })

    @action(detail=False, methods=['post'])
    def remove(self, request):
        serializer = RemoveCartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            if cart.items.count() == 0:
                cart.clear_promo_code()
        except Cart.DoesNotExist:
            pass

        return Response({"removed": True})

    @action(detail=False, methods=['post'])
    def clear(self, request):
        serializer = ClearCartSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            cart.clear_promo_code()
        except Cart.DoesNotExist:
            pass
        return Response({"cleared": True})
    
    @action(detail=False, methods=['post'], url_path='apply-promo')
    def apply_promo(self, request):
        """Применить промокод к корзине"""
        cart = self.get_cart()
        serializer = ApplyPromoCodeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        promo = serializer.validated_data['code']
        if cart.apply_promo_code(promo):
            return Response(
                self.get_serializer(cart).data,
                status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Не удалось применить промокод"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['post'], url_path='remove-promo')
    def remove_promo(self, request):
        """Удалить промокод из корзины"""
        cart = self.get_cart()
        serializer = RemovePromoCodeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        cart.clear_promo_code()
        return Response(
            self.get_serializer(cart).data,
            status=status.HTTP_200_OK
        )


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='create-from-cart')
    @transaction.atomic
    def create_from_cart(self, request):
        user = request.user
        try:
            cart = user.cart
        except Cart.DoesNotExist:
            return Response(
                {"detail": "Корзина пуста"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_items = cart.items.select_related('product')
        if not cart_items.exists():
            return Response(
                {"detail": "Корзина пуста"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in cart_items:
            if not item.product.is_available:
                return Response(
                    {"detail": f"Продукт {item.product.name} недоступен"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        delivery_address = request.data.get("delivery_address", user.address)
        first_name = request.data.get("first_name", user.first_name)
        last_name = request.data.get("last_name", user.last_name)
        if not delivery_address or not first_name or not last_name:
            return Response(
                {"detail": "Необходимо заполнить адрес доставки, имя и фамилию."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order_data = {
            'user': user,
            'delivery_address': delivery_address,
            'total_price': cart.calculate_total(),
        }
        
        if cart.promo_code:
            order_data['promo_code'] = cart.promo_code

        order = Order.objects.create(**order_data)

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_per_item=item.product.price
            )

        if cart.promo_code:
            cart.promo_code.mark_as_used()

        cart.items.all().delete()
        cart.clear_promo_code()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        return product.reviews.all().order_by('-created_at')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(user=self.request.user, product=product)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise permissions.PermissionDenied("Можно редактировать только свои отзывы.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("Можно удалять только свои отзывы.")
        instance.delete()


class PromoCodeViewSet(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PromoCode.objects.filter(
            user=self.request.user,
            is_used=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        user = request.user
        new_or_last_promo = PromoCode.create_daily_promo(user)
        serializer = self.get_serializer(new_or_last_promo)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def has_attempt(self, request):
        user = request.user
        now = timezone.now()

        has_active_promo = PromoCode.objects.filter(
            user=user,
            created_at__date=now.date(),
            expires_at__gt=now
        ).exists()

        return Response({"has_attempt": not has_active_promo})
