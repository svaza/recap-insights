import { forwardRef, useId } from "react";
import type { WowItem } from "./WowItemCard";
import { WowItemRenderer } from "./WowItemRenderer";

const WowCarousel = forwardRef<HTMLDivElement, { items: WowItem[] }>(function WowCarousel(props, ref) {
    if (props.items.length === 0) return null;

    const carouselId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

    return (
        <div
            ref={ref}
            id={carouselId}
            className="carousel slide"
            data-bs-ride="false"
            data-bs-interval="false"
            data-bs-touch="true"
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
