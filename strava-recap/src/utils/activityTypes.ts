/**
 * Activity type metadata: emoji and description
 */
type ActivityTypeInfo = {
    emoji: string;
    description: string;
};

const activityTypes: Record<string, ActivityTypeInfo> = {
    AlpineSki: { emoji: "⛷️", description: "Downhill / resort alpine skiing" },
    BackcountrySki: { emoji: "🎿", description: "Backcountry skiing / ski touring" },
    Badminton: { emoji: "🏸", description: "Badminton (racket sport)" },
    Canoeing: { emoji: "🛶", description: "Canoeing (paddle)" },
    Crossfit: { emoji: "🏋️", description: "CrossFit-style mixed training" },
    EBikeRide: { emoji: "🚴⚡", description: "E-bike ride" },
    Elliptical: { emoji: "🏃‍♂️", description: "Elliptical trainer workout" },
    EMountainBikeRide: { emoji: "🚵⚡", description: "E-mountain bike ride" },
    Golf: { emoji: "⛳", description: "Golf" },
    GravelRide: { emoji: "🚴🪨", description: "Gravel cycling" },
    Handcycle: { emoji: "♿🚴", description: "Handcycle" },
    HighIntensityIntervalTraining: { emoji: "🔥⏱️", description: "HIIT / interval workout" },
    Hike: { emoji: "🥾", description: "Hiking" },
    IceSkate: { emoji: "⛸️", description: "Ice skating" },
    InlineSkate: { emoji: "🛼", description: "Inline skating / rollerblading" },
    Kayaking: { emoji: "🛶", description: "Kayaking" },
    Kitesurf: { emoji: "🪁🏄", description: "Kitesurfing" },
    MountainBikeRide: { emoji: "🚵", description: "Mountain biking" },
    NordicSki: { emoji: "🎿", description: "Cross-country (Nordic) skiing" },
    OpenWaterSwim: { emoji: "🌊🏊", description: "Open-water swimming" },
    Other: { emoji: "🧩", description: "Other / uncategorized activity" },
    Padel: { emoji: "🎾", description: "Padel (racket sport)" },
    Pickleball: { emoji: "🏓", description: "Pickleball" },
    Pilates: { emoji: "🧘", description: "Pilates" },
    Racquetball: { emoji: "🎾", description: "Racquetball" },
    Ride: { emoji: "🚴", description: "Cycling ride (general)" },
    RockClimbing: { emoji: "🧗", description: "Rock climbing" },
    RollerSki: { emoji: "🎿🛼", description: "Roller skiing" },
    Rowing: { emoji: "🚣", description: "Rowing" },
    Rugby: { emoji: "🏉", description: "Rugby" },
    Run: { emoji: "🏃", description: "Running" },
    Sail: { emoji: "⛵", description: "Sailing" },
    Skateboard: { emoji: "🛹", description: "Skateboarding" },
    Snowboard: { emoji: "🏂", description: "Snowboarding" },
    Snowshoe: { emoji: "❄️🥾", description: "Snowshoeing" },
    Soccer: { emoji: "⚽", description: "Soccer / football" },
    Squash: { emoji: "🎾", description: "Squash" },
    StairStepper: { emoji: "🧗‍♀️", description: "Stair stepper workout" },
    StandUpPaddling: { emoji: "🏄‍♂️", description: "Stand-up paddleboarding (SUP)" },
    Surfing: { emoji: "🏄", description: "Surfing" },
    Swim: { emoji: "🏊", description: "Swimming (general / pool)" },
    TableTennis: { emoji: "🏓", description: "Table tennis" },
    Tennis: { emoji: "🎾", description: "Tennis" },
    TrailRun: { emoji: "🏃⛰️", description: "Trail running" },
    Transition: { emoji: "🔄", description: "Triathlon/duathlon transition segment (T1/T2)" },
    Velomobile: { emoji: "🚴🚗", description: "Velomobile (enclosed recumbent)" },
    VirtualRide: { emoji: "🖥️🚴", description: "Virtual / indoor cycling" },
    VirtualRow: { emoji: "🖥️🚣", description: "Virtual / indoor rowing" },
    VirtualRun: { emoji: "🖥️🏃", description: "Virtual / indoor running" },
    Walk: { emoji: "🚶", description: "Walking" },
    WaterSport: { emoji: "🌊🏄", description: "General water sport (unspecified bucket)" },
    WeightTraining: { emoji: "🏋️", description: "Strength / weight training" },
    Wheelchair: { emoji: "♿", description: "Wheelchair activity" },
    Windsurf: { emoji: "🌬️🏄", description: "Windsurfing" },
    Workout: { emoji: "💪", description: "General workout (misc fitness)" },
    Yoga: { emoji: "🧘", description: "Yoga / mobility / stretching" },
};

/**
 * Gets the emoji for an activity type
 */
export function getActivityEmoji(type: string): string {
    return activityTypes[type]?.emoji ?? "✨";
}

/**
 * Gets the description for an activity type
 */
export function getActivityDescription(type: string): string {
    return activityTypes[type]?.description ?? type;
}

/**
 * Gets the full description with emoji for an activity type
 */
export function getActivityTypeDescription(type: string): string {
    const info = activityTypes[type];
    if (!info) return `✨ ${type}`;
    return `${info.emoji} ${info.description}`;
}
