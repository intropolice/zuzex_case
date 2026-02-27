import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY =
  process.env.OPENWEATHERMAP_API_KEY || '10948230148262dec970372be88728ee';

const BAD_WEATHER_MAIN = new Set([
  'Thunderstorm',
  'Drizzle',
  'Rain',
  'Snow',
  'Mist',
  'Smoke',
  'Haze',
  'Dust',
  'Fog',
  'Sand',
  'Ash',
  'Squall',
  'Tornado',
]);

export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get('lat');
    const lon = req.nextUrl.searchParams.get('lon');

    const params = new URLSearchParams({
      appid: OPENWEATHER_API_KEY,
      units: 'metric',
      lang: 'ru',
    });

    if (lat && lon) {
      params.set('lat', lat);
      params.set('lon', lon);
    } else {
      params.set('q', 'Moscow,ru');
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Weather API error', detail: text || response.statusText },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      weather?: Array<{ main?: string; description?: string }>;
      main?: { temp?: number };
      name?: string;
    };

    const weatherMain = data.weather?.[0]?.main ?? 'Clear';
    const weatherDescription = data.weather?.[0]?.description ?? 'ясно';

    return NextResponse.json({
      city: data.name ?? 'Moscow',
      weatherMain,
      weatherDescription,
      temperature: data.main?.temp ?? null,
      isBadWeather: BAD_WEATHER_MAIN.has(weatherMain),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load weather',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
