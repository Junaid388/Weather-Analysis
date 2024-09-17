import { Droplets, ShieldAlertIcon, Thermometer, Wind } from "lucide-react";


const WeatherCard = (props) => {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br py-5">
      <div className="transition-all duration-300 ease-in-out transform hover:scale-110">
        <div className="w-80 p-6 bg-white rounded-lg shadow-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{props.data.city}</h2>
            {/* <Cloud className="w-10 h-10" /> */}
            <img src={props.data.icon} alt={props.data.description} className="w-10 h-10"></img>
          </div>
          <div className="mb-4">
            <p className="text-6xl font-bold">{props.data.temperature}°C</p>
            <p className="text-xl">{props.data.description}</p>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 mr-1" />
              <span>Feel like {props.data.feels_like}°C</span>
            </div>
            <div className="flex items-center">
              <Droplets className="w-4 h-4 mr-1" />
              <span>Humidity {props.data.humidity}%</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div className="flex items-center">
              <Wind className="w-4 h-4 mr-1" />
              <span>Wind {props.data.wind_kph} km/h</span>
            </div>
            <div className="flex items-center">
              <ShieldAlertIcon className="w-4 h-4 mr-1" />
              <span>UV {props.data.uv}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
export default WeatherCard;