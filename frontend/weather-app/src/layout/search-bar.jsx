
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import NoWeatherResponse from "@/components/ui/no-weather-response";
import Spinner from "@/components/ui/spinner";
import WeatherCard from "@/components/ui/weather-card";
import axios from 'axios';
import { Search } from "lucide-react";
import { useState } from 'react';


const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SearchBar = () => {
    // const BASE_URL = 'http://localhost:8000/';
    const BASE_URL = 'https://weather-analysis-esuu.onrender.com/';
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [noResponse, setNoResponse] = useState(false);     // State to control spinner visibility
    const [data, setData] = useState([]);
    const [currentData, setCurrentData] = useState([]);
    const [alertData, setAlertData] = useState([]);              // State to store response data
    const csrfToken = getCookie('csrftoken');

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);  // Update the inputValue state as the user types
    };
    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent the form from reloading the page
        setLoading(true);  // Show the spinner while fetching data
        setNoResponse(false);
        console.log("City:", inputValue);  // You can use this to confirm the city is updated

        try {
            const response = await weatherApiCall(inputValue);
            setData(response.daily_forecasts); // Store the response data
            setCurrentData(response.weather_data)
            setAlertData(response.alerts)
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]); // Store the response data
            setCurrentData([])
            setAlertData([])
        } finally {
            setLoading(false);  // Hide spinner after data is fetched
        }
    };


    const weatherApiCall = (city) => {
        return new Promise((resolve, reject) => {
            const weatherUrl = BASE_URL + 'api/';

            axios.post(weatherUrl, { city: city }, {
                headers: {
                    'X-CSRFToken': csrfToken  // Assuming CSRF token is needed
                }
            })
                .then(response => {
                    if (response.data.error) { // Check if an error exists in the response
                        console.error('Error:', response.data.error);
                        setNoResponse(true)
                        reject(response.data.error);  // Reject the promise with the error
                    } else {
                        console.log(response.data);
                        setNoResponse(false)
                        resolve(response.data);  // Resolve the promise with weather data
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    reject(error);  // Reject the promise in case of an error
                });
        });
    };

    return (
        <>
            <div className="flex items-center justify-center py-5">
                <div className="w-full max-w-[70%] px-4">
                    <form className="flex w-full items-center space-x-2" onSubmit={handleSubmit}>
                        <div className="relative flex-grow">
                            <Input
                                type="search"
                                placeholder="Enter City"
                                className="w-full pr-10 rounded-full"
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-0 top-0 h-full rounded-l-none rounded-r-full"
                            >
                                <Search className="h-4 w-4" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Show spinner if loading */}
            {loading && <div><Spinner /></div>}
            {(data.length > 0 && !loading) ? <WeatherCard data={[currentData, alertData]}/> : (noResponse && <NoWeatherResponse />)
            }

            {/* Show cards based on the response data */}
            <div className="flex items-center justify-center w-full max-w-18xl overflow-x-auto">
                <div className="flex space-x-4 p-4">
                    {data.length > 0 && !loading && data.map((day, index) => (
                        <div key={index} className="flex-shrink-0 w-60 bg-gray-800 rounded-lg shadow-md p-4 text-center">
                            <p className="font-semibold">{getDay(day.date_epoch)}</p>
                            <p className="text-sm mb-2">{day.date}</p>
                            <img src={day.icon} alt={day.description} className="w-12 h-12 mx-auto my-2"></img>
                            <p className="text-sm font-medium mb-2">{day.description}</p>
                            <p className="text-sm">
                                <span className="font-medium">H: {day.max_temp}°</span>{" "}
                                <span className="text-gray-400">L: {day.min_temp}°</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

function getDay(epoch) {
    let date = new Date(epoch * 1000);
    return days[date.getDay()]
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default SearchBar;