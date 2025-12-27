/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateShareCode } from "@/lib/share-code";
import { hex, luminance } from "@/lib/color";
const ColorThief = require("colorthief");

const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN;
const tmdbApiBaseUrl = process.env.TMDB_API_URL;
const tmdbImageBaseUrl = process.env.TMDB_IMAGE_URL;

const headers = {
  Authorization: `Bearer ${tmdbBearerToken}`,
  accept: "application/json",
};

// 提取图片主题色
async function extractDominantColor(imageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const palette = await ColorThief.getPalette(buffer);
    const colors = palette.slice(0, 3);
    colors.sort(
      (a: [number, number, number], b: [number, number, number]) =>
        luminance(a[0], a[1], a[2]) - luminance(b[0], b[1], b[2])
    );
    return colors.map((c: [number, number, number]) => hex(c[0], c[1], c[2]));
  } catch (error) {
    console.error("Error extracting color:", "image: " + imageUrl, error);
    return [];
  }
}

async function searchMovie(keyword: string) {
  try {
    // 搜索电影
    const currentYear = new Date().getFullYear();
    const params = new URLSearchParams();
    params.set("query", encodeURIComponent(keyword));
    params.set("include_adult", "false");
    params.set("language", "zh-CN");
    params.set("primary_release_year", currentYear.toString());
    params.set("page", "1");
    const tmdbApiUrl = `${tmdbApiBaseUrl}/3/search/movie?${params.toString()}`;
    const response = await fetch(tmdbApiUrl, { headers });
    const data = await response.json();
    const { id } = data.results[0];
    return id;
  } catch (error) {
    console.error("Error searching movie: " + keyword, error);
    return null;
  }
}

// 从 TMDB API 获取电影信息
async function fetchMovieInfo(id: number) {
  try {
    // 先查询数据库中是否已存在该电影
    try {
      const { data: existingMovie, error: queryError } = await supabaseAdmin
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (!queryError && existingMovie) {
        return existingMovie;
      }
    } catch (dbError) {
      // 数据库查询失败，继续执行 API 调用
      console.log("Database query failed, fetching from API:", dbError);
    }

    // 如果数据库中不存在，继续从 TMDB API 获取信息
    const detailApiUrl = `${tmdbApiBaseUrl}/3/movie/${id}?language=zh-CN`;
    const logoImageApiUrl = `${tmdbApiBaseUrl}/3/movie/${id}/images?language=zh-CN`;
    const [detailResponse, imagesResponse] = await Promise.all([
      fetch(detailApiUrl, { headers }),
      fetch(logoImageApiUrl, { headers }),
    ]);

    // 获取电影详细信息
    const { title, release_date, runtime, genres, backdrop_path, poster_path } =
      await detailResponse.json();
    const backdrop_url = `${tmdbImageBaseUrl}/t/p/w600_and_h600_face${backdrop_path}`;
    const backdrop_colors = await extractDominantColor(backdrop_url);
    const poster_url = `${tmdbImageBaseUrl}/t/p/w500${poster_path}`;
    const poster_colors = await extractDominantColor(poster_url);
    const imagesData = await imagesResponse.json();
    const logoPath = imagesData.logos[0].file_path;
    const logoUrl = `${tmdbImageBaseUrl}/t/p/w500${logoPath}`;

    return {
      id,
      title,
      release_date,
      logo_url: logoUrl,
      runtime,
      genres: genres?.map((g: { name: string }) => g.name),
      backdrop_url,
      poster_url,
      backdrop_colors,
      poster_colors,
    };
  } catch (error) {
    console.error("Error fetching movie info: " + id, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieList } = body;

    // 获取电影信息
    console.log(movieList);
    const ids = await Promise.all(movieList.map(searchMovie));
    console.log(ids);
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const movieInfos = await Promise.all(uniqueIds.map(fetchMovieInfo));
    const successfulMovies = movieInfos.filter(Boolean);

    // 插入数据库
    // 使用 upsert，如果 id 已存在则更新
    const { error: moviesError } = await supabaseAdmin
      .from("movies")
      .upsert(successfulMovies, {
        onConflict: "id",
        ignoreDuplicates: true,
      });
    if (moviesError) {
      console.error("Error upserting movies:", moviesError);
      return NextResponse.json(
        { error: "Failed to insert movies" },
        { status: 500 }
      );
    }

    // 生成唯一分享码
    const shareCode = generateShareCode();
    // 创建报告记录
    const { data: reportData, error: reportError } = await supabaseAdmin
      .from("reports")
      .insert({
        share_code: shareCode,
        movies: successfulMovies.map((movie) => movie.id),
      })
      .select()
      .single();
    if (reportError || !reportData) {
      console.error("Error creating report:", reportError);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shareCode,
      movies: { successful: successfulMovies },
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
