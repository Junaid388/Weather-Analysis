import datetime
import os
from datetime import datetime

import requests
from django.http import JsonResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser

from .models import CurrentWeather, ForecastDay, HourlyForecast, Location


# Create your views here.
@csrf_exempt
def index(request):
    api_key = os.environ.get('WEATHER_API')
    # current_weather_url = 'http://api.weatherapi.com/v1/current.json?key={}&q={}&aqi=no'
    forecast_url = 'http://api.weatherapi.com/v1/forecast.json?key={}&q={}&days={}&aqi=no&alerts=no'
    # print(JSONParser().parse(request))
    if request.method == 'POST':
        city = JSONParser().parse(request)['city1']

        weather_data1, daily_forecasts1 = fetch_weather_and_forecast(city, api_key, forecast_url)

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
    


def fetch_weather_and_forecast(city, api_key, forecast_url,days=3):
    # response = requests.get(current_weather_url.format(api_key,city)).json()
    
    forecast_response = requests.get(forecast_url.format(api_key, city, days)).json()
    print(forecast_response)

    # if forecast_response.status_code == 200:
    # weather_data = forecast_response.json()
    store_weather_data(forecast_response)
    weather_data = {
    'city': city,
    'temperature': forecast_response['current']['temp_c'],
    'description': forecast_response['current']['condition']['text'],
    'icon': forecast_response['current']['condition']['icon'],
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
    # else:
    #     return weather_data, daily_forecasts # ToDo empty response

def store_weather_data(data):
    # 1. Store location data
    location_data = data['location']
    location, created = Location.objects.get_or_create(
        name=location_data['name'],
        region=location_data['region'],
        country=location_data['country'],
        latitude=location_data['lat'],
        longitude=location_data['lon'],
        timezone=location_data['tz_id'],
        localtime=datetime.fromtimestamp(location_data['localtime_epoch'])
    )

    # 2. Store current weather data
    current_data = data['current']
    CurrentWeather.objects.create(
        location=location,
        last_updated=datetime.fromtimestamp(current_data['last_updated_epoch']),
        temp_c=current_data['temp_c'],
        temp_f=current_data['temp_f'],
        is_day=current_data['is_day'],
        condition_text=current_data['condition']['text'],
        condition_icon=current_data['condition']['icon'],
        condition_code=current_data['condition']['code'],
        wind_mph=current_data['wind_mph'],
        wind_kph=current_data['wind_kph'],
        wind_degree=current_data['wind_degree'],
        wind_dir=current_data['wind_dir'],
        pressure_mb=current_data['pressure_mb'],
        pressure_in=current_data['pressure_in'],
        precip_mm=current_data['precip_mm'],
        precip_in=current_data['precip_in'],
        humidity=current_data['humidity'],
        cloud=current_data['cloud'],
        feelslike_c=current_data['feelslike_c'],
        feelslike_f=current_data['feelslike_f'],
        uv=current_data['uv'],
        gust_mph=current_data['gust_mph'],
        gust_kph=current_data['gust_kph']
    )

    # 3. Store forecast data
    forecast_data = data['forecast']['forecastday']
    for forecast_day in forecast_data:
        forecast = ForecastDay.objects.create(
            location=location,
            date=datetime.fromtimestamp(forecast_day['date_epoch']),
            maxtemp_c=forecast_day['day']['maxtemp_c'],
            maxtemp_f=forecast_day['day']['maxtemp_f'],
            mintemp_c=forecast_day['day']['mintemp_c'],
            mintemp_f=forecast_day['day']['mintemp_f'],
            avgtemp_c=forecast_day['day']['avgtemp_c'],
            avgtemp_f=forecast_day['day']['avgtemp_f'],
            maxwind_mph=forecast_day['day']['maxwind_mph'],
            maxwind_kph=forecast_day['day']['maxwind_kph'],
            totalprecip_mm=forecast_day['day']['totalprecip_mm'],
            totalprecip_in=forecast_day['day']['totalprecip_in'],
            avghumidity=forecast_day['day']['avghumidity'],
            condition_text=forecast_day['day']['condition']['text'],
            condition_icon=forecast_day['day']['condition']['icon'],
            condition_code=forecast_day['day']['condition']['code'],
            uv=forecast_day['day']['uv']
        )

        # 4. Store hourly forecast data for each forecast day
        for hour in forecast_day['hour']:
            HourlyForecast.objects.create(
                forecast_day=forecast,
                time=datetime.fromtimestamp(hour['time_epoch']),
                temp_c=hour['temp_c'],
                temp_f=hour['temp_f'],
                is_day=hour['is_day'],
                condition_text=hour['condition']['text'],
                condition_icon=hour['condition']['icon'],
                condition_code=hour['condition']['code'],
                wind_mph=hour['wind_mph'],
                wind_kph=hour['wind_kph'],
                wind_degree=hour['wind_degree'],
                wind_dir=hour['wind_dir'],
                pressure_mb=hour['pressure_mb'],
                pressure_in=hour['pressure_in'],
                precip_mm=hour['precip_mm'],
                precip_in=hour['precip_in'],
                humidity=hour['humidity'],
                cloud=hour['cloud'],
                feelslike_c=hour['feelslike_c'],
                feelslike_f=hour['feelslike_f'],
                gust_mph=hour['gust_mph'],
                gust_kph=hour['gust_kph'],
                uv=hour['uv']
            )