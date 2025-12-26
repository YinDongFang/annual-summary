import { gsap } from "gsap";
import { X } from "lucide-react";
import { useRef, useEffect } from "react";

interface TicketProps {
  movie: Movie;
  onClose: () => void;
}

// 格式化时长
function formatRuntime(minutes?: number): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} 小时 ${mins} 分钟`;
  } else if (hours > 0) {
    return `${hours} 小时`;
  } else {
    return `${mins} 分钟`;
  }
}

export function Ticket({ movie, onClose }: TicketProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 计算主题色渐变背景
  const gradient = movie.dominant_color
    ? `linear-gradient(to bottom, ${movie.dominant_color}80, ${movie.dominant_color}40)`
    : "linear-gradient(to bottom, rgba(59, 130, 246, 1), rgba(59, 130, 246, 1))";

  useEffect(() => {
    // 3D 旋转进入动画
    gsap.fromTo(
      cardRef.current,
      {
        rotationY: -90,
        opacity: 0,
        scale: 0.8,
      },
      {
        rotationY: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      }
    );

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current, {
      rotationY: 90,
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: "back.in(1.7)",
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
    });
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      <div
        ref={cardRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        style={{ perspective: "1000px" }}
      >
        <div
          className="shadow-2xl max-w-lg w-[80vw] left-[10vw] pointer-events-auto absolute"
          style={{
            transformStyle: "preserve-3d",
            maskImage: "url('/ticket.png')",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: "url('/ticket.png')",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        >
          <img src="/ticket.png" alt="ticket" className="w-full" />
          <div className="absolute inset-0">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 背景渐变 */}
            <div
              className="absolute inset-0"
              style={{ background: gradient }}
            />

            {/* Backdrop 图片 */}
            {movie.backdrop_url && (
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={movie.backdrop_url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />
              </div>
            )}

            {/* 内容区域 */}
            <div className="relative p-6 text-white">
              <h3 className="text-3xl font-bold mb-4 font-playfair">
                {movie.title}
              </h3>

              {/* 上映时间 */}
              {movie.release_date && (
                <div className="mb-2">
                  <span className="text-gray-300 text-sm">上映时间：</span>
                  <span className="font-inter">
                    {new Date(movie.release_date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* 观看日期 */}
              {movie.date && (
                <div className="mb-2">
                  <span className="text-gray-300 text-sm">观看日期：</span>
                  <span className="font-inter">
                    {new Date(movie.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* 时长 */}
              {movie.runtime && (
                <div className="mb-2">
                  <span className="text-gray-300 text-sm">时长：</span>
                  <span className="font-inter">
                    {formatRuntime(movie.runtime)}
                  </span>
                </div>
              )}

              {/* 类型 */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-inter"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* 评分 */}
              {movie.rating !== undefined && movie.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-300 text-sm">评分：</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < movie.rating!
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo 图片（底部） */}
              {movie.logo_url && (
                <div className="mt-6 flex justify-center">
                  <img
                    src={movie.logo_url}
                    alt={`${movie.title} logo`}
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
