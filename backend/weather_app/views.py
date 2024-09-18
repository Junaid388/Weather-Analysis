import datetime
import os
import threading
from datetime import datetime, timedelta

import requests
from django.db.models import Avg, Max, Min
from django.http import JsonResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from dotenv import dotenv_values
from rest_framework.parsers import JSONParser

from .models import CurrentWeather, ForecastDay, HourlyForecast, Location


# View to get average temperature for the 24 hours
def next_24_hour_forecast(request, city_name):
    now = timezone.now()

    # Create a list of times for the next 24 hours in 30-minute intervals
    times = []
    current_time = now.replace(minute=0, second=0, microsecond=0)
    for _ in range(48):  # 48 intervals (24 hours * 2 per hour)
        times.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=30)

    # Query the hourly forecast for the next 24 hours (including temperatures, humidity, and time)
    hourly_data = HourlyForecast.objects.filter(
        forecast_day__location__name=city_name,
        time__gte=now,
        time__lt=now + timedelta(hours=24)
    ).values('time', 'temp_c', 'humidity').order_by('time')

    # Create dictionaries of the hourly data keyed by the time in "HH:MM" format
    temperature_data = {data['time'].strftime("%H:%M"): data['temp_c'] for data in hourly_data}
    humidity_data = {data['time'].strftime("%H:%M"): data['humidity'] for data in hourly_data}

    

    # Calculate trends: average temperature and humidity over the last 24 hours
    avg_temp = HourlyForecast.objects.filter(
        forecast_day__location__name=city_name,
        time__gte=now - timedelta(hours=24),
        time__lt=now
    ).aggregate(Avg('temp_c'))['temp_c__avg']

    avg_humidity = HourlyForecast.objects.filter(
        forecast_day__location__name=city_name,
        time__gte=now - timedelta(hours=24),
        time__lt=now
    ).aggregate(Avg('humidity'))['humidity__avg']

    # Create lists of temperatures and humidity where missing times are filled with None
    temperatures = [temperature_data.get(time, avg_temp) for time in times]
    humidity = [humidity_data.get(time, avg_humidity) for time in times]

    # Prepare result
    result = {
        'times': times,
        'temperatures': temperatures,
        'humidity': humidity,
        'average_temperature_last_24_hours': avg_temp,
        'average_humidity_last_24_hours': avg_humidity
    }

    return JsonResponse(result)



@csrf_exempt
def index(request):
    api_key = os.environ.get('weather_api')
    forecast_url = 'http://api.weatherapi.com/v1/forecast.json?key={}&q={}&days={}&aqi=no&alerts=yes'
    # print(JSONParser().parse(request))
    if request.method == 'POST':
        city = JSONParser().parse(request)['city']
        context = fetch_weather_and_forecast(city, api_key, forecast_url)
        return JsonResponse(context, safe=False)
    else:
        return JsonResponse(null, safe=False)
    


def fetch_weather_and_forecast(city, api_key, forecast_url,days=7):
    
    try:
        forecast_response = requests.get(forecast_url.format(api_key, city, days)).json()
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}


    if 'error' in forecast_response:
        return {'error': forecast_response['error']}
    
    weather_data = {
    'city': forecast_response['location']['name'],
    'temperature': forecast_response['current']['temp_c'],
    'description': forecast_response['current']['condition']['text'],
    'icon': forecast_response['current']['condition']['icon'],
    'feels_like':forecast_response['current']['feelslike_c'],
    'humidity':forecast_response['current']['humidity'],
    'wind_kph':forecast_response['current']['wind_kph'],
    'uv':forecast_response['current']['uv'],

    }

    daily_forecasts = []
    for daily_data in forecast_response['forecast']['forecastday']:
        daily_forecasts.append({
            'day': daily_data['date'],
            'min_temp': round(daily_data['day']['mintemp_c']),
            'max_temp': round(daily_data['day']['maxtemp_c']),
            'description': daily_data['day']['condition']['text'],
            'icon': daily_data['day']['condition']['icon'],
            'date_epoch': daily_data['date_epoch']
        })

        context = {
            'weather_data': weather_data,
            'daily_forecasts': daily_forecasts,
            'alerts': forecast_response['alerts']
        }
    # store_weather_data(forecast_response)
    # Start a background thread to store the data
    threading.Thread(target=store_weather_data, args=(forecast_response,)).start()
    return context

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
        localtime=timezone.make_aware(datetime.fromtimestamp(location_data['localtime_epoch']))  # Make aware
    )

    # 2. Store current weather data
    current_data = data['current']
    CurrentWeather.objects.create(
        location=location,
        last_updated=timezone.make_aware(datetime.fromtimestamp(current_data['last_updated_epoch'])),
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
            date=timezone.make_aware(datetime.strptime(forecast_day['date'], '%Y-%m-%d')),
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
                time=timezone.make_aware(datetime.fromtimestamp(hour['time_epoch'])),
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