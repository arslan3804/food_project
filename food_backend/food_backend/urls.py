"""food_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf.urls import url

schema_view = get_schema_view(
   openapi.Info(
      title="Food Project API",
      default_version='v1',
      description="""
API для проекта Food Project.

## Основные возможности
* Управление пользователями и аутентификация через JWT
* Работа с категориями и продуктами
* Управление корзиной покупок
* Оформление заказов
* Система промокодов и скидок
* Отзывы о продуктах

## Аутентификация
Для большинства запросов требуется JWT-токен. Чтобы получить токен:
1. Зарегистрируйтесь через `/api/v1/users/`
2. Получите токен через `/api/v1/jwt/create/`
3. Используйте токен в заголовке: `Authorization: Bearer <ваш_токен>`
      """,
      terms_of_service="",
      contact=openapi.Contact(
          name="Арслан",
          email="arslan384@yandex.ru",
          url="https://github.com/yourusername"
      ),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
   patterns=[path('api/', include('api.urls'))],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Добавляем URL'ы для документации только если DEBUG=True или хост в ALLOWED_HOSTS
if settings.DEBUG or not settings.ALLOWED_HOSTS or '*' in settings.ALLOWED_HOSTS:
    urlpatterns += [
        url(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
        url(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
        url(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 