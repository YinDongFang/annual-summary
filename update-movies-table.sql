-- 更新 movies 表，添加新的电影信息字段
-- 执行日期: 2024

-- 添加 logo_url 字段：电影 logo 图片 URL
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 添加 runtime 字段：电影时长（分钟）
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS runtime INTEGER;

-- 添加 genres 字段：电影类型数组
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS genres TEXT[];

-- 添加 backdrop_url 字段：电影背景图片 URL
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS backdrop_url TEXT;

-- 添加 dominant_color 字段：背景图片的主题色（RGB 格式，如 'rgb(123,45,67)'）
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS dominant_color TEXT;

-- 添加注释说明字段用途
COMMENT ON COLUMN movies.logo_url IS '电影 logo 图片 URL，来自 TMDB API';
COMMENT ON COLUMN movies.runtime IS '电影时长，单位：分钟';
COMMENT ON COLUMN movies.genres IS '电影类型数组，如：["动作", "科幻", "冒险"]';
COMMENT ON COLUMN movies.backdrop_url IS '电影背景图片 URL，来自 TMDB API';
COMMENT ON COLUMN movies.dominant_color IS '背景图片的主题色，RGB 格式，用于前端渐变背景';

