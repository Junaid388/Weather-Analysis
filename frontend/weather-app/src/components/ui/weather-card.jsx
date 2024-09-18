import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import { AlertTriangle, Droplets, ShieldAlertIcon, Thermometer, Wind } from "lucide-react";
import { useState } from "react";


const WeatherCard = (props) => {
  console.log(props.data)
  // const BASE_URL = 'http://localhost:8000/';
  const BASE_URL = 'https://weather-analysis-esuu.onrender.com/';
  const [temperatureData, setTemperatureData] = useState({times: [],
    temperatures: []});
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [ currentData, setCurrentData] = useState(props.data[0])
  const [ weatherData, setWeatherData] = useState(props.data[1])
  const [loading, setLoading] = useState(false);

  const renderChart = (data, color, maxValue) => (
    <svg viewBox="0 0 1000 400" className="w-full h-full">
      <g transform="translate(50, 20)">
        {data.map((value, index) => (
          <g key={index}>
            {index > 0 && (
              <line
                x1={(index - 1) * (900 / 47)}
                y1={360 - (data[index - 1] / maxValue) * 360}
                x2={index * (900 / 47)}
                y2={360 - (value / maxValue) * 360}
                stroke={color}
                strokeWidth="2"
              />
            )}
            <circle
              cx={index * (900 / 47)}
              cy={360 - (value / maxValue) * 360}
              r="4"
              fill={color}
            />
          </g>
        ))}
        {temperatureData.times.filter((_, i) => i % 4 === 0).map((time, index) => (
          <g key={index} transform={`translate(${index * 4 * (900 / 47)}, 360)`}>
            <line x1="0" y1="0" x2="0" y2="10" stroke="black" strokeWidth="1" />
            <text x="0" y="25" fontSize="12" textAnchor="middle" fill="black">
              {time}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, index) => (
          <g key={index} transform={`translate(-10, ${360 - tick * 360})`}>
            <line x1="0" y1="0" x2="10" y2="0" stroke="black" strokeWidth="1" />
            <text x="-5" y="5" fontSize="12" textAnchor="end" fill="black">
              {(maxValue * tick).toFixed(0)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  async function handleClick()  {
    
    try {
        const response = await weatherTrendApiCall();
        console.log(response)
        setTemperatureData(response)
        setLoading(true)
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
      setLoading(false)
    }
};
  const weatherTrendApiCall = () => {
    return new Promise((resolve, reject) => {
        const weatherUrl = BASE_URL + 'api/trends/temperature/'+currentData.city;

        axios.get(weatherUrl,
        )
            .then(response => {
                resolve(response.data);  // Resolve the promise with weather data
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);  // Reject the promise in case of an error
            });
    });
};
  return (
    <div className="flex items-center justify-center bg-gradient-to-br py-5">
      <div className="transition-all duration-300 ease-in-out transform hover:scale-110">
        <div className="w-80 p-6 bg-white rounded-lg shadow-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          {weatherData.alert && weatherData.alert.length > 0 && (
            <Alert className="mb-4 bg-red-500/90 text-white border-red-600">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-lg font-semibold">Weather Alert</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="font-medium">{weatherData.alert[0].event}</p>
                <p className="text-sm mt-1">{weatherData.alert[0].headline}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/50"
                  onClick={() => setIsAlertOpen(true)}
                >
                  View Details
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{currentData.city}</h2>
            {/* <Cloud className="w-10 h-10" /> */}
            <img src={currentData.icon} alt={currentData.description} className="w-10 h-10"></img>
          </div>
          <div className="mb-4">
            <p className="text-6xl font-bold">{currentData.temperature}°C</p>
            <p className="text-xl">{currentData.description}</p>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 mr-1" />
              <span>Feel like {currentData.feels_like}°C</span>
            </div>
            <div className="flex items-center">
              <Droplets className="w-4 h-4 mr-1" />
              <span>Humidity {currentData.humidity}%</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div className="flex items-center">
              <Wind className="w-4 h-4 mr-1" />
              <span>Wind {currentData.wind_kph} km/h</span>
            </div>
            <div className="flex items-center">
              <ShieldAlertIcon className="w-4 h-4 mr-1" />
              <span>UV {currentData.uv}</span>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={handleClick}>
              <Button 
                variant="outline" 
                className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/50"
              >
                Show 24h Trend
              </Button>
            </DialogTrigger>
            {temperatureData.times.length > 0 && <DialogContent className="w-[90vw] max-w-[1200px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-4">24-Hour Weather Trend</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="temperature" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="temperature" className="text-lg py-2">Temperature</TabsTrigger>
                  <TabsTrigger value="humidity" className="text-lg py-2">Humidity</TabsTrigger>
                </TabsList>
                <TabsContent value="temperature">
                  <div className="h-[60vh] w-full bg-white p-4 rounded-lg shadow">
                    {renderChart(temperatureData.temperatures, "red", Math.max(...temperatureData.temperatures))}
                  </div>
                  <div className="mt-4 text-lg">
                    Average temperature: {temperatureData.average_temperature_last_24_hours.toFixed(1)}°C
                  </div>
                </TabsContent>
                <TabsContent value="humidity">
                  <div className="h-[60vh] w-full bg-white p-4 rounded-lg shadow">
                    {renderChart(temperatureData.humidity, "blue", 100)}
                  </div>
                  <div className="mt-4 text-lg">
                    Average humidity: {temperatureData.average_humidity_last_24_hours.toFixed(1)}%
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
}
          </Dialog>
        </div>
      </div>
      {weatherData.alert && weatherData.alert.length > 0 && (
        <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <DialogContent className="w-[90vw] max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4 text-red-600">
                {weatherData.alert[0].event}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <p className="font-semibold mb-2">{weatherData.alert[0].headline}</p>
              <p className="mb-2"><span className="font-semibold">Effective:</span> {new Date(weatherData.alert[0].effective).toLocaleString()}</p>
              <p className="mb-2"><span className="font-semibold">Expires:</span> {new Date(weatherData.alert[0].expires).toLocaleString()}</p>
              <p className="mb-2"><span className="font-semibold">Areas:</span> {weatherData.alert[0].areas}</p>
              <p className="whitespace-pre-wrap">{weatherData.alert[0].desc}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
};
export default WeatherCard;