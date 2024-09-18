from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('trends/temperature/<str:city_name>', views.next_24_hour_forecast, name='next_24_hour_forecast'),
]