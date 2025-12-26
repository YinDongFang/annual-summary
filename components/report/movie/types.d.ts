interface Movie {
  id: string;
  title: string;
  date?: string;
  release_date?: string;
  poster_url?: string;
  logo_url?: string;
  runtime?: number;
  genres?: string[];
  backdrop_url?: string;
  dominant_color?: string;
  rating?: number;
  summary?: string;
}
