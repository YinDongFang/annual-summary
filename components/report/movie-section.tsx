import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { gsap } from "gsap";
import { Waterfall } from "./movie/Waterfall";
import { Ticket } from "./movie/Ticket";

interface MovieSectionProps {
  movies: Movie[];
  onSubPageChange?: (subPage: "summary" | "gallery") => void;
  onGalleryScrollChange?: (isAtBottom: boolean) => void;
}

export interface MovieSectionRef {
  getCurrentSubPage: () => "summary" | "gallery";
  switchToGallery: () => void;
  isGalleryAtBottom: () => boolean;
}

export const MovieSection = forwardRef<MovieSectionRef, MovieSectionProps>(
  ({ movies, onSubPageChange, onGalleryScrollChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showGallery, setShowGallery] = useState(false);

    // 计算统计数据
    const totalMovies = movies.length;
    const averageRating =
      movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.length || 0;
    // 假设每部电影平均时长 120 分钟
    const totalMinutes = totalMovies * 120;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // 初始化动画
    useEffect(() => {
      if (!showGallery) {
        // 显示总结报告
        gsap.fromTo(
          summaryRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }
        );
      }
    }, [showGallery]);

    // 通知父组件子页面变化
    useEffect(() => {
      if (onSubPageChange) {
        onSubPageChange(showGallery ? "gallery" : "summary");
      }
    }, [showGallery, onSubPageChange]);

    // 检测照片墙滚动位置（用于判断是否可以切换到下一个主页面）
    // 注意：这个功能现在由MovieWaterfall组件内部处理
    useEffect(() => {
      if (!showGallery || !onGalleryScrollChange) return;

      // 暂时设置为false，因为MovieWaterfall组件会自己处理滚动
      // 如果需要，可以通过ref暴露滚动状态
      onGalleryScrollChange(false);
    }, [showGallery, onGalleryScrollChange]);

    // 切换到照片墙
    const switchToGallery = () => {
      if (!showGallery) {
        setShowGallery(true);
        gsap.to(summaryRef.current, {
          opacity: 0,
          y: -50,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.fromTo(
              galleryRef.current,
              { opacity: 0, y: 100 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
              }
            );
          },
        });
      }
    };

    // 检查照片墙是否滚动到底部
    const isGalleryAtBottom = (): boolean => {
      // MovieWaterfall组件会自己处理滚动，这里返回false表示可以继续滚动
      return false;
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getCurrentSubPage: () => (showGallery ? "gallery" : "summary"),
      switchToGallery,
      isGalleryAtBottom,
    }));

    const handleMovieClick = (movie: Movie) => {
      setSelectedMovie(movie);
    };

    // 生成星空位置（使用 lazy initialization）
    const [stars] = useState<
      Array<{
        left: number;
        top: number;
        width: number;
        height: number;
        opacity: number;
        animation: number;
      }>
    >(() =>
      Array.from({ length: 50 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        animation: Math.random() * 3 + 2,
      }))
    );

    return (
      <section ref={containerRef} className="relative h-screen overflow-hidden">
        {/* 深色渐变星空背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-black">
          {/* 星空效果 */}
          <div className="absolute inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.width}px`,
                  height: `${star.height}px`,
                  opacity: star.opacity,
                  animation: `twinkle ${star.animation}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* 总结报告 */}
        {!showGallery && (
          <div
            ref={summaryRef}
            className="relative z-10 h-full flex items-start justify-start px-8 pt-12 md:px-16 md:pt-20"
          >
            <div className="text-left text-white max-w-4xl">
              <h2
                className="text-6xl md:text-8xl font-bold mb-8 font-playfair"
                style={{ textShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
              >
                观影时光
              </h2>
              <div className="space-y-6 text-2xl md:text-3xl font-inter">
                <p className="opacity-90">
                  这一年，你们共同观看了
                  <span className="text-blue-300 font-bold mx-2 text-4xl md:text-5xl font-lemonada">
                    {totalMovies}
                  </span>
                  部电影
                </p>
                {totalHours > 0 && (
                  <p className="opacity-90">
                    累计观影时长
                    <span className="text-blue-300 font-bold mx-2 text-4xl md:text-5xl font-lemonada">
                      {totalHours}
                    </span>
                    小时
                    {remainingMinutes > 0 && (
                      <>
                        <span className="text-blue-300 font-bold mx-2 text-4xl md:text-5xl font-lemonada">
                          {remainingMinutes}
                        </span>
                        分钟
                      </>
                    )}
                  </p>
                )}
                {averageRating > 0 && (
                  <p className="opacity-90">
                    平均评分
                    <span className="text-yellow-300 font-bold mx-2 text-4xl md:text-5xl font-lemonada">
                      {averageRating.toFixed(1)}
                    </span>
                    分
                  </p>
                )}
                <p className="text-xl md:text-2xl mt-8 opacity-70 italic font-playfair">
                  每一帧画面，都是你们共同的回忆
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 照片墙 - 瀑布流 */}
        {showGallery && (
          <div ref={galleryRef} className="relative z-10 h-full ">
            <Waterfall
              movies={movies}
              onMovieClick={handleMovieClick}
              columns={5}
            />
          </div>
        )}

        {/* 底部电影院图片 */}
        <div className="absolute bottom-0 left-0 right-0">
          <img
            src="/watch-movie-with-light.png"
            alt="Cinema"
            className="object-cover object-bottom w-full h-auto"
          />
        </div>

        {/* 3D 卡片弹出 */}
        {selectedMovie && (
          <Ticket
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          @keyframes twinkle {
            0%,
            100% {
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
          }
        `}</style>
      </section>
    );
  }
);

MovieSection.displayName = "MovieSection";
