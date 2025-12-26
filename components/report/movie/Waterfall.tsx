import { useEffect, useMemo, useRef, useState } from "react";
import { picker } from "@/lib/utils";
import { gsap } from "gsap";

interface Movie {
  uid?: number;
  id: string;
  title: string;
  poster_url?: string;
}

interface WaterfallProps {
  movies: Movie[];
  columns: number;
  onMovieClick?: (movie: Movie) => void;
}

function getPosition(
  container: HTMLDivElement,
  child: HTMLElement,
  columns: number,
  gap: number,
  itemHeight: number
) {
  const index = Array.from(container.children).indexOf(child);
  const left = `calc(${(100 / columns) * (index % columns)}% - ${
    (gap / columns) * (index % columns) - gap
  }px)`;
  if (index < columns) {
    const top = "0px";
    return [left, top];
  } else {
    const prev = container.children[index - columns] as HTMLElement;
    const top = parseFloat(prev.style.top) + itemHeight + gap + "px";
    return [left, top];
  }
}

export function Waterfall({
  movies,
  columns = 5,
  onMovieClick,
}: WaterfallProps) {
  const gap = 10;
  const aspectRatio = 3 / 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Movie[]>([]);

  const pick = useMemo(() => {
    const pick = picker(movies);
    let id = 0;
    return () => ({ ...pick(), uid: id++ });
  }, [movies]);

  const getItemHeight = () => {
    const { clientWidth } = containerRef.current!;
    const columnWidth = (clientWidth - gap * (columns - 1)) / columns;
    return columnWidth / aspectRatio;
  };

  const populate = () => {
    const container = containerRef.current!;
    const { clientHeight } = container;
    const itemHeight = getItemHeight();
    const rows = Math.ceil((clientHeight - gap) / (itemHeight + gap)) + 1;
    setItems((items) => {
      const count = rows * columns;
      if (count < items.length) return items.slice();
      const newSize = count - items.length;
      return [...items, ...new Array(newSize).fill(null).map(pick)];
    });
  };

  useEffect(() => {
    const container = containerRef.current!;

    // 循环移动
    const move = (time: number, deltaTime: number) => {
      const itemHeight = getItemHeight();
      let replace = false;
      Array.from(container.children).forEach((child) => {
        const element = child as HTMLElement;
        const top = parseFloat(element.style.top) - deltaTime * 0.05;
        element.style.top = top + "px";
        replace = replace || top < -itemHeight;
      });
      if (replace) {
        setItems((items) => [
          ...items.slice(columns),
          ...new Array(columns).fill(null).map(pick),
        ]);
      }
    };
    gsap.ticker.add(move);

    // 监听子元素变化
    const mutationObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            const element = node as HTMLElement;
            const [left, top] = getPosition(
              container,
              element,
              columns,
              gap,
              getItemHeight()
            );
            element.style.top = top;
            element.style.left = left;
          });
        }
      }
    });
    mutationObserver.observe(container, { childList: true });

    // 监听尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      Array.from(container.children)
        .slice(columns)
        .forEach((child) => {
          const element = child as HTMLElement;
          const [left, top] = getPosition(
            container,
            element,
            columns,
            gap,
            getItemHeight()
          );
          element.style.top = top;
          element.style.left = left;
        });
      populate();
    });
    resizeObserver.observe(container);

    populate();

    return () => {
      gsap.ticker.remove(move);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="w-full relative"
      style={{
        height: "calc(100vh - 60vw)",
        maskImage: `linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)`,
      }}
      ref={containerRef}
    >
      {items.map((item, index) => (
        <div
          key={item.uid}
          className="absolute"
          style={{
            aspectRatio,
            width: `calc(${100 / columns}% - ${gap / columns + gap}px)`,
          }}
        >
          <img
            src={item.poster_url!}
            className="object-cover w-full h-full relative rounded-sm"
            style={{
              top: (index % columns) % 2 ? `-50%` : 0,
            }}
            onClick={() => onMovieClick?.(item)}
          />
        </div>
      ))}
    </div>
  );
}
