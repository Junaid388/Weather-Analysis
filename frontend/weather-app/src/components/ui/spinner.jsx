export default function Spinner() {
    return (
      <div className="flex items-center justify-center screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] h-12 w-12 text-blue-600" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-lg font-semibold">Loading weather data...</p>
        </div>
      </div>
    )
  }