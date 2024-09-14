import datetime
import os

import requests
from django.http import JsonResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser


# Create your views here.
@csrf_exempt
def index(request):
    api_key = os.environ.get('WEATHER_API')
    current_weather_url = 'http://api.weatherapi.com/v1/current.json?key={}&q={}&aqi=no'
    forecast_url = 'http://api.weatherapi.com/v1/forecast.json?key={}&q={}&days={}&aqi=no&alerts=no'
    # print(JSONParser().parse(request))
    if request.method == 'POST':
        city1 = JSONParser().parse(request)['city1']

        weather_data1, daily_forecasts1 = fetch_weather_and_forecast(city1, api_key, current_weather_url, forecast_url)

        # if city2:
        #     weather_data2, daily_forecasts2 = fetch_weather_and_forecast(city2, api_key, current_weather_url,
        #                                                                  forecast_url)
        # else:
        #     weather_data2, daily_forecasts2 = None, None

        context = {
            'weather_data1': weather_data1,
            'daily_forecasts1': daily_forecasts1,
            # 'weather_data2': weather_data2,
            # 'daily_forecasts2': daily_forecasts2,
        }

        return JsonResponse(context, safe=False)
    else:
        return JsonResponse(null, safe=False)
    


def fetch_weather_and_forecast(city, api_key, current_weather_url, forecast_url,days=3):
    response = requests.get(current_weather_url.format(api_key,city)).json()
    forecast_response = requests.get(forecast_url.format(api_key, city, days)).json()

    weather_data = {
        'city': city,
        'temperature': response['current']['temp_c'],
        'description': response['current']['condition']['text'],
        'icon': response['current']['condition']['icon'],
    }

    daily_forecasts = []
    for daily_data in forecast_response['forecast']['forecastday']:
        daily_forecasts.append({
            'day': daily_data['date'],
            'min_temp': round(daily_data['day']['mintemp_c']),
            'max_temp': round(daily_data['day']['maxtemp_c']),
            'description': daily_data['day']['condition']['text'],
            'icon': daily_data['day']['condition']['icon'],
        })

    return weather_data, daily_forecasts