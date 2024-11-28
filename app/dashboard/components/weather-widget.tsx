import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export async function WeatherWidget() {
  const weatherData = await getCurrentWeatherData();

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-semibold">Current</h4>
            {weatherData && (
              <>
                <p>Temperature: {Math.round(weatherData?.current?.temp)}°F</p>
                <p>
                  Description:{" "}
                  {`${weatherData?.current?.weather[0].main}, 
              ${weatherData?.current?.weather[0].description}`}
                </p>
              </>
            )}
          </div>
          <div>
            <h4 className="text-xl font-semibold">Daily Summary</h4>
            <p>{weatherData.daily[0].summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function getCurrentWeatherData() {
  const lat = 39.5218362;
  const lon = -104.7929517;

  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch current weather data");
  }

  return response.json();
}
