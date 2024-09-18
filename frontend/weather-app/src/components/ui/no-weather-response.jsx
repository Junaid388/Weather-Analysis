import { AlertCircle } from "lucide-react"

export default function NoWeatherResponse() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Weather Data Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find weather information for the city you searched. Please try another city or check if the name is spelled correctly.
        </p>
        <p className="text-sm text-gray-500">
          Tip: Try using the full city name (e.g., "London")
        </p>
      </div>
    </div>
  )
}