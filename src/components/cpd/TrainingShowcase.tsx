import { useEffect, useLayoutEffect, useRef, useState, type TransitionEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { Reveal } from "@/components/cpd/Reveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CarouselItem = {
  id: number;
  title: string;
  description: string;
  date_from: string;
  date_to: string;
  category: string;
  picture_path: string | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80";

function formatDateRange(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  if (from === to) return f.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  return `${f.toLocaleDateString("en-MY", { day: "numeric", month: "short" })} – ${t.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`;
}

function itemImageUrl(item: CarouselItem) {
  if (!item.picture_path) return FALLBACK_IMAGE;
  return `/${item.picture_path}`;
}

async function fetchCarouselItems(): Promise<CarouselItem[]> {
  const res = await fetch("/api/carousel");
  if (!res.ok) throw new Error("Failed to load carousel content.");
  const data = await res.json();
  return data.items as CarouselItem[];
}

const INTERVAL_MS = 5000;

export function TrainingShowcase() {
  const { data: items = [] } = useQuery({
    queryKey: ["carousel"],
    queryFn: fetchCarouselItems,
    staleTime: 60_000,
  });

  const COUNT = items.length;
  const LOOP_ITEMS = COUNT > 0 ? [...items, ...items, ...items] : [];
  const START_INDEX = COUNT;

  const [index, setIndex] = useState<number>(START_INDEX);
  const [withTransition, setWithTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLElement | null>(null);
  const indexRef = useRef(index);

  indexRef.current = index;
  const logicalIndex = COUNT > 0 ? ((index % COUNT) + COUNT) % COUNT : 0;

  // reset index when items load
  useEffect(() => {
    if (COUNT > 0) setIndex(COUNT);
  }, [COUNT]);

  useLayoutEffect(() => {
    const measure = () => {
      const card = firstCardRef.current;
      const track = trackRef.current;
      if (!card || !track) return;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      setStepPx(card.getBoundingClientRect().width + gap);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useEffect(() => {
    if (paused || stepPx === 0 || COUNT === 0) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setWithTransition(true);
      setIndex((current) => current + 1);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [paused, stepPx, COUNT]);

  useEffect(() => {
    if (withTransition) return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setWithTransition(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [withTransition]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== trackRef.current || event.propertyName !== "transform") return;
    const current = indexRef.current;
    if (current < COUNT * 2) return;
    setWithTransition(false);
    setIndex(current - COUNT);
  };

  const goTo = (targetLogical: number) => {
    setWithTransition(true);
    setIndex(START_INDEX + targetLogical);
  };

  if (COUNT === 0) return null;

  return (
    <>
      <section id="training-showcase" className="relative overflow-hidden bg-background py-20 sm:py-28">
        <div className="container mx-auto">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">Training Showcase</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Building capability across RCMP
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A selection of recent CPD programmes that help staff grow clinical skills, leadership, and teaching
              excellence.
            </p>
          </Reveal>
        </div>

        <div
          className="relative mt-12 sm:mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              onTransitionEnd={handleTransitionEnd}
              className={cn(
                "flex gap-6 sm:gap-8 lg:gap-10",
                withTransition && "transition-transform duration-700 ease-out",
              )}
              style={{
                transform:
                  stepPx > 0
                    ? `translate3d(calc(50% - ${stepPx / 2}px - ${index * stepPx}px), 0, 0)`
                    : undefined,
              }}
            >
              {LOOP_ITEMS.map((item, loopIndex) => {
                const isActive = loopIndex === index;
                return (
                  <article
                    key={`${item.id}-${loopIndex}`}
                    ref={loopIndex === 0 ? firstCardRef : undefined}
                    className={cn(
                      "w-[min(20rem,72vw)] shrink-0 transition-opacity duration-500",
                      isActive ? "opacity-100" : "opacity-50",
                    )}
                    aria-hidden={!isActive}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        goTo(loopIndex % COUNT);
                        if (isActive) setSelectedItem(item);
                      }}
                      aria-label={item.title}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <div className="overflow-hidden rounded-2xl bg-muted">
                        <img
                          src={itemImageUrl(item)}
                          alt=""
                          className="aspect-[3/2] h-auto w-full object-cover"
                          loading={loopIndex < COUNT + 2 ? "eager" : "lazy"}
                          decoding="async"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                      </div>
                      <div className="mt-4 space-y-1.5 px-1 sm:mt-5 sm:space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.category} · {formatDateRange(item.date_from, item.date_to)}
                        </p>
                        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
                          {item.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        {isActive && (
                          <p className="text-xs font-medium text-primary">Click to read more →</p>
                        )}
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="container mx-auto mt-8 flex items-center justify-center gap-2 sm:mt-10">
            {items.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={dotIndex === logicalIndex}
                onClick={() => goTo(dotIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  dotIndex === logicalIndex ? "w-8 bg-secondary" : "w-1.5 bg-border hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {selectedItem && (
            <>
              <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
                <img
                  src={itemImageUrl(selectedItem)}
                  alt={selectedItem.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
              </div>
              <div className="p-6">
                <DialogHeader className="mb-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{selectedItem.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDateRange(selectedItem.date_from, selectedItem.date_to)}
                    </span>
                  </div>
                  <DialogTitle className="font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                    {selectedItem.title}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                  {selectedItem.description}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
