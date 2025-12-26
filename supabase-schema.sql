-- 情侣年度报告生成器数据库 Schema

-- reports 表：主报告表
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- movies 表：观影记录
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE,
  release_date DATE,
  poster_url TEXT,
  logo_url TEXT,
  runtime INTEGER,
  genres TEXT[],
  backdrop_url TEXT,
  dominant_color TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- concerts 表：演唱会记录
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  artist TEXT NOT NULL,
  date DATE,
  venue TEXT,
  poster_url TEXT,
  tags TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- travels 表：旅游记录
CREATE TABLE IF NOT EXISTS travels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  date DATE,
  photos TEXT[],
  ai_image_url TEXT,
  tags TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_reports_share_code ON reports(share_code);
CREATE INDEX IF NOT EXISTS idx_movies_report_id ON movies(report_id);
CREATE INDEX IF NOT EXISTS idx_concerts_report_id ON concerts(report_id);
CREATE INDEX IF NOT EXISTS idx_travels_report_id ON travels(report_id);

-- 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 reports 表创建触发器
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

