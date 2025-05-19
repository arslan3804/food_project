from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductImageViewSet,
    CartItemViewSet,
    OrderViewSet,
    ReviewViewSet,
    PromoCodeViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('images', ProductImageViewSet, basename='image')
router.register('cart', CartItemViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')
router.register('promo-codes', PromoCodeViewSet, basename='promocode')

review_router = DefaultRouter()
review_router.register('reviews', ReviewViewSet, basename='reviews')

urlpatterns = [
    path('v1/', include('djoser.urls')),
    path('v1/', include('djoser.urls.jwt')),
    path('v1/', include(router.urls)),
    path('v1/products/<int:product_id>/', include(review_router.urls))
]
