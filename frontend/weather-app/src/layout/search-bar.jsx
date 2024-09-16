
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useState } from 'react';




const SearchBar = () => {
    // const BASE_URL = 'http://localhost:8000/';
    BASE_URL = 'https://weather-analysis-esuu.onrender.com/';
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);     // State to control spinner visibility
    const [data, setData] = useState([]);
    const [currentData, setCurrentData] = useState([]);              // State to store response data
    const csrfToken = getCookie('csrftoken');

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);  // Update the inputValue state as the user types
    };
    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent the form from reloading the page
        setLoading(true);  // Show the spinner while fetching data
        console.log("City:", inputValue);  // You can use this to confirm the city is updated

        // Simulating an API call (you can replace this with your actual API request)
        try {
            // Fake API request simulation (replace with axios, fetch, etc.)
            const response = await weatherApiCall(inputValue);
            setData(response.daily_forecasts1); // Store the response data
            setCurrentData(response.weather_data1)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);  // Hide spinner after data is fetched
        }
    };
        

    const weatherApiCall = (city) => {
        return new Promise((resolve, reject) => {
            const weatherUrl = BASE_URL+'app/';
    
            axios.post(weatherUrl, { city1: city }, {
                headers: {
                    'X-CSRFToken': csrfToken  // Assuming CSRF token is needed
                }
            })
            .then(response => {
                // console.log(response.data);
                resolve(response.data );  // Resolve the promise with weather data
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);  // Reject the promise in case of an error
            });
        });
    };
    
    return (
        <>
        
            <form onSubmit={handleSubmit}>
            <div className="flex justify-center mt-4 pt-10">
            <Input
                type="text"
                placeholder="Enter City..."
                className="w-96 p-2 border border-gray-300 rounded-l-md"
                style={{ width: '1000px' }}
                value={inputValue}
                onChange={handleInputChange}
            />
            <button className="p-2 bg-blue-500 text-white rounded-r-md" type='submit'>
                Search
            </button>
            </div>
            </form>
            {/* Show spinner if loading */}
            {loading && <div className="spinner">Loading...</div>}
            

            {data.length > 0  &&
            <section className='items-center justify-center py-4'>
            <Card>
                        <CardHeader>
                            <CardTitle>{currentData.city}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2>{currentData.temperature}</h2>
                            <p>{currentData.description}</p>
                            <img src={currentData.icon} alt={ currentData.description }></img>
                        </CardContent>
                    </Card>
            </section>
}

            {/* Show cards based on the response data */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {data.length > 0 && data.map((item, index) => (
                <div key={index}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{item.day}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{ item.min_temp }°C - { item.max_temp }°C</p>
                            <p>{ item.description }</p>
                            <img src={item.icon } alt={ item.description }></img>
                        </CardContent>
                    </Card>
                    </div>
                ))}
        </section>
        </>
    );
};

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