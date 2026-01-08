import { forwardRef, useId, useRef, useState } from "react";
import type { WowItem } from "./WowItemCard";
import { WowItemRenderer } from "./WowItemRenderer";

const WowCarousel = forwardRef<HTMLDivElement, { items: WowItem[] }>(function WowCarousel(props, ref) {
    if (props.items.length === 0) return null;

    const carouselId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const carouselRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const carouselElement = carouselRef.current;
            if (carouselElement) {
                // Use Bootstrap's carousel API
                const bootstrap = (window as any).bootstrap;
                if (bootstrap && bootstrap.Carousel) {
                    const carousel = bootstrap.Carousel.getInstance(carouselElement) || new bootstrap.Carousel(carouselElement);
                    if (isLeftSwipe) {
                        carousel.next();
                    } else {
                        carousel.prev();
                    }
                }
            }
        }
    };

    return (
        <div
            ref={(node) => {
                carouselRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            id={carouselId}
            className="carousel slide"
            data-bs-ride="false"
            data-bs-interval="false"
            data-bs-touch="true"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* <div className="carousel-indicators position-static mt-3 gap-2">
                {props.items.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        data-bs-target={`#${carouselId}`}
                        data-bs-slide-to={idx}
                        className={idx === 0 ? "active" : ""}
                        aria-current={idx === 0 ? "true" : undefined}
                        aria-label={`Slide ${idx + 1}`}
                    ></button>
                ))}
            </div> */}
            <div className="carousel-inner">
                {props.items.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`carousel-item ${idx === 0 ? "active" : ""}`}
                    >
                        <WowItemRenderer item={item} />
                    </div>
                ))}
            </div>

            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="prev"
                aria-label="Previous"
            >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
            </button>
            <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="next"
                aria-label="Next"
            >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
});

export default WowCarousel;
