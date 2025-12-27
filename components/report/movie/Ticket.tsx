import { fitTextToWidth } from "@/lib/utils";
import { gsap } from "gsap";
import { X } from "lucide-react";
import { useRef, useEffect, useMemo } from "react";

interface TicketProps {
  movie: Movie;
  onClose: () => void;
}

export function Ticket({ movie, onClose }: TicketProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 计算主题色渐变背景
  const light = movie.backdrop_colors.reverse()[0];
  const gradient1 = `linear-gradient(160deg, ${movie.backdrop_colors.join(",")})`;
  const gradient2 = `linear-gradient(160deg, transparent 60%, ${movie.backdrop_colors.reverse()[0]})`;

  console.log(movie.backdrop_colors);

  const width = 80;
  const padding = 20;

  const fontSize = useMemo(() => {
    const title = movie.title;
    const singleLineWidth =
      (document.body.clientWidth * width) / 100 - padding * 2;
    const fontStyle = {
      fontFamily: "var(--font-playfair)",
      fontWeight: "bold",
    };
    const maxFontSize = fitTextToWidth(
      new Array(10).fill("国").join(""),
      fontStyle,
      singleLineWidth
    );
    const autoSize = fitTextToWidth(title, fontStyle, singleLineWidth * 1.2);
    return Math.min(autoSize - 1, maxFontSize - 1);
  }, [movie]);

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
        className="shadow-2xl absolute z-50 top-1/2 translate-y-[-50%] text-white"
        style={{
          width: `${width}vw`,
          left: `${(100 - width) / 2}vw`,
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
        {/* 展位图片 */}
        <img src="/ticket.png" alt="ticket" className="w-full invisible" />
        {/* 背景渐变 */}
        <div className="absolute inset-0" style={{ background: gradient1 }} />
        {/* 背景渐变 */}
        <div
          className="absolute inset-0"
          style={{
            background: gradient2,
            maskImage: "url('/ticket-border.png')",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            opacity: 0.2,
          }}
        />
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="absolute inset-0 font-playfair">
          {/* 封面图片 */}
          <img
            src={movie.backdrop_url}
            className="w-full aspect-square object-cover"
          />
          {/* 内容区域 */}
          <div
            className="relative flex flex-col justify-around"
            style={{
              padding: `${padding / 1.5}px ${padding}px`,
              aspectRatio: "3/1",
            }}
          >
            {/* 标题 */}
            <h3 className="font-bold" style={{ fontSize: `${fontSize}px` }}>
              {movie.title}
            </h3>
            {/* 上映时间 时长 */}
            <div className="text-xl flex items-center gap-4 leading-2">
              <span>{movie.release_date}</span>
              <span>
                <span>{movie.runtime}</span>
                <span className="text-sm">mins</span>
              </span>
            </div>
          </div>
          <div style={{ padding: `${padding}px` }}>
            {/* 类型 */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                类型：{movie.genres.join(" / ")}
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
    </>
  );
}
