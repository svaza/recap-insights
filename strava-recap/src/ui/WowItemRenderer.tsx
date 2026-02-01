import type { WowItem } from "./WowItemCard";
import WowActiveDays from "./wow/WowActiveDays";
import WowBiggestEffort from "./wow/WowBiggestEffort";
import WowFarthest from "./wow/WowFarthest";
import WowStreak from "./wow/WowStreak";
import WowEiffel from "./wow/WowEiffel";
import WowFloors from "./wow/WowFloors";
import WowFields from "./wow/WowFields";
import WowMarathons from "./wow/WowMarathons";
import WowLaps from "./wow/WowLaps";
import WowEarth from "./wow/WowEarth";
import WowMoon from "./wow/WowMoon";
import WowBurj from "./wow/WowBurj";
import WowEmpire from "./wow/WowEmpire";
import WowEbc from "./wow/WowEbc";
import WowMetric from "./wow/WowMetric";

const WOW_COMPONENTS: Record<string, React.ComponentType<{ item: WowItem }>> = {
    "active-days": WowActiveDays,
    "biggest-effort": WowBiggestEffort,
    "farthest": WowFarthest,
    "streak": WowStreak,
    "eiffel": WowEiffel,
    "floors": WowFloors,
    "fields": WowFields,
    "marathons": WowMarathons,
    "laps": WowLaps,
    "earth": WowEarth,
    "moon": WowMoon,
    "burj": WowBurj,
    "empire": WowEmpire,
    "ebc": WowEbc,
    "avg-pace": WowMetric,
    "avg-session": WowMetric,
    "climb-density": WowMetric,
    "dominant-sport": WowMetric,
    "variety": WowMetric,
    "busiest-week": WowMetric,
    "biggest-climb": WowMetric,
    "fastest-pace": WowMetric,
    "best-5k": WowMetric,
    "best-10k": WowMetric,
    "most-active-day": WowMetric,
    "time-of-day": WowMetric,
    "avg-hr": WowMetric,
    "max-hr": WowMetric,
};

export function WowItemRenderer(props: { item: WowItem }) {
    const Component = WOW_COMPONENTS[props.item.id];
    
    if (!Component) {
        return <div>Unknown wow item: {props.item.id}</div>;
    }
    
    return <Component item={props.item} />;
}

export default WowItemRenderer;
