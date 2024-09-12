# Weather Analysis System
## Overview
This project is a Weather Analysis System built using Django as the backend and React as the frontend. It fetches real-time weather data from a public API (such as WeatherAPI), processes it, and provides weather insights. The system raises alerts for extreme weather conditions and displays this information on the web interface. It also allows users to view trends such as average temperature and humidity for a specific city over time.

## Features
Fetch Real-Time Weather Data: Integrates with a public API to fetch live weather data for one or more cities.
Data Processing: Computes insights such as average temperature, humidity trends, etc., over a specific period.
Extreme Weather Alerts: Displays alerts when extreme weather conditions (e.g., storms, heatwaves) are detected.
User-Friendly Interface: A React frontend provides a responsive and clean interface to visualize the weather data and trends.
Deployment: The application is deployed on Render.com.
## Tech Stack
## Backend (Django):
Python 3.x
Django
Django Rest Framework (DRF)
PostgreSQL (or SQLite for local development)
WeatherAPI (or any public weather API)
## Frontend (React):
React
Axios (for API calls)
Tailwind CSS (for styling)
## Requirements
## Backend:
Python 3.x
Django 3.x or higher
Django Rest Framework (DRF)
PostgreSQL (optional)
## Frontend:
Node.js 12+ (for React)
Axios
React 16+ or higher
Tailwind CSS
## Environment Variables:
WEATHER_API_KEY: Your API key for the WeatherAPI service.
DATABASE_URL: Database connection string (if using PostgreSQL).
