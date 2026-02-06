import type { WowItem } from "../WowItemCard";

/**
 * Enriches a WowItem with motivational copy (line1, line2), chips, and footer.
 * All per-card-type intelligence lives here; the unified card component
 * is purely presentational.
 */
export function enrichWowItem(item: WowItem): WowItem {
    if (item.line1 && item.chips && item.footer) return item; // already enriched

    const copy = contextualizeWowCopy(item, getWowCopy(item));
    return { ...item, ...copy };
}

/* ─── Per-type copy generators ─── */

type WowCopy = {
    line1: string;
    line2: string;
    chips: string[];
    footer: string;
};

type HeroTier = "starter" | "solid" | "big" | "elite";
type WowTheme = "effort" | "distance" | "climb" | "speed" | "consistency" | "mix" | "heart";

type ActivityFlavor = {
    label: string;
    cue: string;
    chip: string;
    hint: string;
};

function getWowCopy(item: WowItem): WowCopy {
    switch (item.id) {
        case "biggest-effort":
            return biggestEffortCopy(item);
        case "farthest":
            return farthestCopy(item);
        case "biggest-climb":
            return biggestClimbCopy(item);
        case "fastest-pace":
            return fastestPaceCopy();
        case "best-5k":
            return best5kCopy();
        case "best-10k":
            return best10kCopy();
        case "streak":
            return streakCopy(item);
        case "active-days":
            return activeDaysCopy(item);
        case "avg-pace":
            return avgPaceCopy();
        case "avg-session":
            return avgSessionCopy();
        case "climb-density":
            return climbDensityCopy();
        case "dominant-sport":
            return dominantSportCopy();
        case "variety":
            return varietyCopy();
        case "busiest-week":
            return busiestWeekCopy();
        case "longest-week":
            return longestWeekCopy();
        case "most-active-day":
            return mostActiveDayCopy();
        case "time-of-day":
            return timeOfDayCopy();
        case "avg-hr":
            return avgHrCopy();
        case "max-hr":
            return maxHrCopy();
        case "eiffel":
            return eiffelCopy(item);
        case "floors":
            return floorsCopy(item);
        case "fields":
            return fieldsCopy(item);
        case "marathons":
            return marathonsCopy(item);
        case "laps":
            return lapsCopy(item);
        case "earth":
            return earthCopy(item);
        case "moon":
            return moonCopy(item);
        case "burj":
            return burjCopy(item);
        case "empire":
            return empireCopy(item);
        case "ebc":
            return ebcCopy(item);
        default:
            return defaultCopy();
    }
}

/* ─── Dynamic copy functions ─── */

function biggestEffortCopy(item: WowItem): WowCopy {
    const seconds = parseDurationSeconds(item.value);
    const line1 =
        seconds >= 7200 ? "That's a serious endurance block."
            : seconds >= 3600 ? "That's a solid long session."
                : seconds >= 1800 ? "Nice sustained effort."
                    : "Good work getting it done.";
    const line2 =
        seconds >= 7200 ? "Recover well \u2014 this is where fitness compounds."
            : seconds >= 3600 ? "Stack a few like this and your base jumps."
                : seconds >= 1800 ? "Consistency + sessions like this = progress."
                    : "Keep building. One step at a time.";
    return {
        line1,
        line2,
        chips: [
            seconds >= 3600 ? "\uD83D\uDE80 long session" : "\u26A1 effort",
            seconds >= 7200 ? "\uD83E\uDDE0 patience" : "\uD83E\uDDE0 discipline",
            "\u2705 done",
        ],
        footer: "Keep stacking sessions like this.",
    };
}

function farthestCopy(item: WowItem): WowCopy {
    const miles = parseDistanceMiles(item.value);
    const line1 =
        miles >= 26 ? "That's a big day. Real endurance."
            : miles >= 13 ? "That's a legit long session."
                : miles >= 6 ? "Nice distance \u2014 building the engine."
                    : "Good work. Keep stacking.";
    const line2 =
        miles >= 26 ? "Recover well and you'll bounce back stronger."
            : miles >= 13 ? "Consistency with these changes everything."
                : miles >= 6 ? "Add one more like this every couple weeks."
                    : "Next milestone is closer than you think.";
    return {
        line1,
        line2,
        chips: ["\uD83D\uDCCF distance", miles >= 13 ? "\uD83E\uDDE0 grit" : "\uD83E\uDDB5 endurance", "\u2705 done"],
        footer: "That's not a workout \u2014 that's a journey.",
    };
}

function biggestClimbCopy(item: WowItem): WowCopy {
    const elevation = parseNumber(item.value);
    const line1 =
        elevation >= 2000 ? "That climb was a beast."
            : elevation >= 1000 ? "That climb was a statement."
                : "Solid climb work.";
    const line2 =
        elevation >= 2000 ? "Recovery matters \u2014 elevation load is real."
            : elevation >= 1000 ? "Elevation work builds real power."
                : "Keep stacking the hills.";
    return {
        line1,
        line2,
        chips: ["\u26F0\uFE0F climb", "\uD83E\uDDB5 strength", "\u2705 done"],
        footer: "Vertical makes you durable.",
    };
}

function fastestPaceCopy(): WowCopy {
    return {
        line1: "That pace is cooking.",
        line2: "Speed shows up when consistency does.",
        chips: ["\u26A1 pace", "\uD83C\uDFCE\uFE0F fast", "\u2705 done"],
        footer: "Keep showing up and the pace drops.",
    };
}

function best5kCopy(): WowCopy {
    return {
        line1: "Strong 5k rhythm.",
        line2: "Sharp speed work is paying off.",
        chips: ["\uD83C\uDFC1 5k", "\u26A1 pace", "\u2705 done"],
        footer: "That's a benchmark to build on.",
    };
}

function best10kCopy(): WowCopy {
    return {
        line1: "That 10k pace is legit.",
        line2: "Endurance + speed = results.",
        chips: ["\uD83C\uDFC1 10k", "\u26A1 pace", "\u2705 done"],
        footer: "You're built for this distance.",
    };
}

function streakCopy(item: WowItem): WowCopy {
    const days = parseInt(String(item.value).replace(/\D/g, ""), 10) || 0;
    const line1 =
        days >= 21 ? "This is identity-level consistency."
            : days >= 10 ? "That streak is doing damage (in a good way)."
                : days >= 3 ? "Keep the chain alive \u2014 next one gets easier."
                    : "Start small, then protect the streak.";
    const line2 =
        days >= 21 ? "When you show up like this, results become inevitable."
            : days >= 10 ? "Don't overcook it \u2014 consistency beats hero days."
                : days >= 3 ? "One more day is the only goal."
                    : "Make it easy to repeat tomorrow.";
    return {
        line1,
        line2,
        chips: ["\uD83D\uDD25 habit", days >= 10 ? "\uD83E\uDDE0 discipline" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Streaks build identity.",
    };
}

function activeDaysCopy(item: WowItem): WowCopy {
    const pctMatch = (item.subtitle || "").match(/(\d+)%/);
    const pct = Number(pctMatch?.[1] || 0);
    const line1 =
        pct >= 75 ? "You showed up again and again."
            : pct >= 50 ? "You're building a real habit."
                : "Momentum starts with one more day.";
    const line2 =
        pct >= 75 ? "Keep this rhythm \u2014 it compounds fast."
            : pct >= 50 ? "Add one extra day/week and you'll feel it."
                : "Aim for consistency, not perfection.";
    return {
        line1,
        line2,
        chips: ["\uD83D\uDCC6 consistency", pct >= 65 ? "\uD83D\uDD25 strong habit" : "\uD83C\uDF31 building", "\u2705 showed up"],
        footer: pct >= 85 ? "You basically live in motion."
            : pct >= 65 ? "Real consistency. Keep stacking."
                : pct >= 45 ? "Good base. One extra day a week = huge."
                    : "Momentum starts here.",
    };
}

/* ─── Static copy for metric-type cards ─── */

function avgPaceCopy(): WowCopy {
    return {
        line1: "Smooth rhythm across your recap.",
        line2: "Consistency makes speed inevitable.",
        chips: ["\u26A1 rhythm", "\uD83E\uDDE0 steady", "\u2705 done"],
        footer: "The pace takes care of itself.",
    };
}

function avgSessionCopy(): WowCopy {
    return {
        line1: "That's your typical session size.",
        line2: "Repeatable volume builds real fitness.",
        chips: ["\uD83D\uDCE6 volume", "\uD83D\uDD01 repeat", "\u2705 done"],
        footer: "Keep the sessions honest.",
    };
}

function climbDensityCopy(): WowCopy {
    return {
        line1: "That's a solid hill profile.",
        line2: "Climbing strength pays off fast.",
        chips: ["\u26F0\uFE0F hills", "\uD83D\uDCAA strength", "\u2705 done"],
        footer: "Hills make you faster on the flat.",
    };
}

function dominantSportCopy(): WowCopy {
    return {
        line1: "Clear focus \u2014 you leaned in.",
        line2: "Mix it up if you want balance.",
        chips: ["\uD83C\uDFAF focus", "\uD83E\uDDE9 balance", "\u2705 done"],
        footer: "Depth in one sport compounds fast.",
    };
}

function varietyCopy(): WowCopy {
    return {
        line1: "Nice mix \u2014 your engine's well rounded.",
        line2: "Different stress, better gains.",
        chips: ["\uD83E\uDDE9 variety", "\uD83C\uDF08 mix", "\u2705 done"],
        footer: "Cross-training keeps things fresh.",
    };
}

function busiestWeekCopy(): WowCopy {
    return {
        line1: "That week was on fire.",
        line2: "Protect that momentum.",
        chips: ["\uD83D\uDCC5 week", "\uD83D\uDD25 surge", "\u2705 done"],
        footer: "Big weeks build big fitness.",
    };
}

function longestWeekCopy(): WowCopy {
    return {
        line1: "That was your biggest week.",
        line2: "Stacking volume pays off.",
        chips: ["\uD83D\uDCC8 distance", "\uD83E\uDDED focus", "\u2705 done"],
        footer: "Volume weeks compound fast.",
    };
}

function mostActiveDayCopy(): WowCopy {
    return {
        line1: "That day was stacked.",
        line2: "When you roll, you roll.",
        chips: ["\uD83D\uDCC5 day", "\uD83D\uDCC8 volume", "\u2705 done"],
        footer: "Big days make big stories.",
    };
}

function timeOfDayCopy(): WowCopy {
    return {
        line1: "Your body clock is dialed in.",
        line2: "Keep leaning into that rhythm.",
        chips: ["\uD83D\uDD52 timing", "\uD83C\uDF19 habit", "\u2705 done"],
        footer: "Routine is a superpower.",
    };
}

function avgHrCopy(): WowCopy {
    return {
        line1: "That effort pushed the engine.",
        line2: "Respect the recovery.",
        chips: ["\u2764\uFE0F avg HR", "\uD83E\uDDE0 control", "\u2705 done"],
        footer: "Heart rate tells the truth.",
    };
}

function maxHrCopy(): WowCopy {
    return {
        line1: "You hit the red zone.",
        line2: "Big efforts demand big recovery.",
        chips: ["\u2764\uFE0F max HR", "\uD83D\uDD25 peak", "\u2705 done"],
        footer: "Peak effort, peak adaptation.",
    };
}

/* ─── Comparison / equivalence cards ─── */

function eiffelCopy(item: WowItem): WowCopy {
    const factor = parseFactor(item.value);
    const line1 =
        factor >= 3 ? "That's a lot of vertical work."
            : factor >= 1.5 ? "Solid climbing \u2014 legs are getting stronger."
                : "Every climb counts. Keep stacking hills.";
    const line2 =
        factor >= 6 ? "Recovery matters here \u2014 elevation load is real."
            : factor >= 3 ? "Consistent hills = durable engine."
                : factor >= 1.5 ? "One extra hill day/week compounds fast."
                    : "Small climbs repeated = big gains.";
    return {
        line1,
        line2,
        chips: ["\u26F0\uFE0F elevation", factor >= 3 ? "\uD83E\uDDB5 strength" : "\uD83C\uDF31 building", "\u2705 earned"],
        footer: "Vertical is where power lives.",
    };
}

function floorsCopy(item: WowItem): WowCopy {
    const floors = parseIntSafe(item.value);
    const line1 =
        floors >= 5000 ? "That's a massive amount of climbing."
            : floors >= 2000 ? "Serious vertical volume. Strong legs."
                : floors >= 600 ? "Solid climb work \u2014 that adds up fast."
                    : "Good work. Small climbs compound.";
    const line2 =
        floors >= 5000 ? "Keep recovery tight \u2014 this is real load."
            : floors >= 2000 ? "Consistent hills build durability."
                : floors >= 600 ? "One extra climb day/week is a big multiplier."
                    : "Stay steady \u2014 the building gets taller.";
    return {
        line1,
        line2,
        chips: ["\uD83E\uDDF1 stairs/hills", floors >= 2000 ? "\uD83E\uDDB5 strength" : "\uD83C\uDF31 building", "\u2705 earned"],
        footer: "Every floor is earned vertical.",
    };
}

function fieldsCopy(item: WowItem): WowCopy {
    const fields = parseIntSafe(item.value);
    const line1 =
        fields >= 2000 ? "That's an absurd amount of ground covered."
            : fields >= 1000 ? "That's real volume. Strong base."
                : fields >= 300 ? "Solid distance \u2014 you covered a lot of ground."
                    : "Good work. Keep stacking sessions.";
    const line2 =
        fields >= 2000 ? "You're doing the boring work that compounds."
            : fields >= 1000 ? "Keep this consistent and your fitness jumps."
                : fields >= 300 ? "One more day a week is a huge multiplier."
                    : "Stay steady \u2014 momentum builds fast.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDFDF\uFE0F distance", fields >= 1000 ? "\uD83E\uDDB5 endurance" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Distance covered is distance earned.",
    };
}

function marathonsCopy(item: WowItem): WowCopy {
    const x = parseFactor(item.value);
    const line1 =
        x >= 10 ? "That's a ridiculous amount of distance."
            : x >= 5 ? "That's a lot of marathon-equivalent volume."
                : x >= 2 ? "Solid mileage \u2014 that's real endurance work."
                    : x >= 1 ? "You crossed the marathon-equivalent mark."
                        : "You're building towards the first marathon-equivalent.";
    const line2 =
        x >= 10 ? "This is compounding work. Recover well."
            : x >= 5 ? "Keep it consistent and everything gets easier."
                : x >= 2 ? "A few blocks like this and fitness jumps."
                    : x >= 1 ? "That's a milestone. Keep stacking."
                        : "One steady week at a time.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDFC1 endurance", x >= 2 ? "\uD83E\uDDE0 grit" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Marathon-distance is the ultimate base.",
    };
}

function lapsCopy(item: WowItem): WowCopy {
    const laps = parseIntSafe(item.value);
    const line1 =
        laps >= 200 ? "That's a lot of laps. Pure consistency."
            : laps >= 80 ? "Serious track volume."
                : laps >= 20 ? "Nice chunk of laps \u2014 solid work."
                    : "Every lap counts. Keep stacking.";
    const line2 =
        laps >= 200 ? "You're building durability the hard way."
            : laps >= 80 ? "This kind of repetition makes you faster."
                : laps >= 20 ? "Do this consistently and the pace follows."
                    : "Show up, repeat, improve.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDFDF\uFE0F track", laps >= 80 ? "\u26A1 repeatability" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Repetition is the path.",
    };
}

function earthCopy(item: WowItem): WowCopy {
    const pct = parsePct(item.value);
    const line1 =
        pct >= 100 ? "That's a full lap around the planet."
            : pct >= 50 ? "That's a big slice of Earth. Serious distance."
                : pct >= 10 ? "Real ground covered. Building huge volume."
                    : "Every bit counts. Keep stacking days.";
    const line2 =
        pct >= 100 ? "You've got the engine \u2014 protect recovery and repeat."
            : pct >= 50 ? "This is the kind of volume that compounds fast."
                : pct >= 10 ? "Consistency is the multiplier here."
                    : "Aim for the next small milestone \u2014 it adds up.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDF0D distance", pct >= 50 ? "\uD83E\uDDED explorer" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Planet-scale distance.",
    };
}

function moonCopy(item: WowItem): WowCopy {
    const pct = parsePct(item.value);
    const line1 =
        pct >= 50 ? "Halfway to the Moon is already insane distance."
            : pct >= 10 ? "That's real travel. Building huge volume."
                : pct >= 1 ? "You're on the way. Keep stacking."
                    : "First percent is closer than it looks.";
    const line2 =
        pct >= 50 ? "Recover well \u2014 this is serious load."
            : pct >= 10 ? "Consistency like this compounds fast."
                : pct >= 1 ? "Steady weeks make this jump quickly."
                    : "One step at a time \u2014 keep moving.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDF15 distance", pct >= 10 ? "\uD83E\uDDE0 consistency" : "\uD83C\uDF31 building", "\u2705 done"],
        footer: "Lunar-scale ambition.",
    };
}

function burjCopy(item: WowItem): WowCopy {
    const x = parseFactor(item.value);
    const line1 =
        x >= 3 ? "That's a serious vertical stack."
            : x >= 1 ? "Solid climbing \u2014 that adds up fast."
                : "Good start. More hills = more gains.";
    const line2 =
        x >= 3 ? "Recovery matters here \u2014 big elevation is real load."
            : x >= 1 ? "Keep it steady and your legs will level up."
                : "Small climbs repeated = big progress.";
    return {
        line1,
        line2,
        chips: ["\u26F0\uFE0F elevation", x >= 3 ? "\uD83E\uDDB5 leg strength" : "\uD83E\uDDE0 consistency", "\u2705 earned"],
        footer: "Climbing builds engine + resilience.",
    };
}

function empireCopy(item: WowItem): WowCopy {
    const x = parseFactor(item.value);
    const line1 =
        x >= 2 ? "That's a lot of vertical work."
            : x >= 1 ? "You hit Empire State roof level. Respect."
                : x >= 0.5 ? "Nice climbing \u2014 that adds up quickly."
                    : "Every bit of elevation counts. Keep building.";
    const line2 =
        x >= 2 ? "Recover well \u2014 elevation load is sneaky."
            : x >= 1 ? "Consistent hills = durable legs."
                : x >= 0.5 ? "One extra hill day/week compounds fast."
                    : "Small climbs repeated = big gains.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDFD9\uFE0F skyline", x >= 1 ? "\uD83E\uDDB5 strength" : "\uD83C\uDF31 building", "\u2705 earned"],
        footer: "Skyline-level altitude.",
    };
}

function ebcCopy(item: WowItem): WowCopy {
    const x = parseFactor(item.value);
    const line1 =
        x >= 2 ? "That's a lot of climbing. Serious vertical."
            : x >= 1 ? "You hit base camp level. Respect."
                : x >= 0.5 ? "You're getting into real elevation territory."
                    : "Every climb counts. Keep building the legs.";
    const line2 =
        x >= 2 ? "Protect recovery \u2014 elevation load is sneaky."
            : x >= 1 ? "Do this consistently and your strength skyrockets."
                : x >= 0.5 ? "One extra hill day/week makes a big difference."
                    : "Small climbs repeated = big progress.";
    return {
        line1,
        line2,
        chips: ["\uD83C\uDFD4\uFE0F elevation", x >= 1 ? "\uD83E\uDDB5 strength" : "\uD83C\uDF31 building", "\u2705 earned"],
        footer: "Everest-grade elevation.",
    };
}

function defaultCopy(): WowCopy {
    return {
        line1: "Nice work.",
        line2: "Keep stacking the basics.",
        chips: ["\uD83D\uDCAA effort", "\uD83E\uDDE0 focus", "\u2705 done"],
        footer: "Keep going.",
    };
}

/* ─── Contextual diversity pass ─── */

const ACTIVITY_DRIVEN_IDS = new Set([
    "biggest-effort",
    "farthest",
    "biggest-climb",
    "fastest-pace",
    "best-5k",
    "best-10k",
    "avg-hr",
    "max-hr",
]);

const THEME_CHIPS: Record<WowTheme, string[]> = {
    effort: ["\uD83D\uDCAA workload", "\uD83D\uDCC8 momentum", "\uD83E\uDDE0 composure"],
    distance: ["\uD83D\uDCCF volume", "\uD83E\uDDB5 endurance", "\uD83D\uDE99\uFE0F engine"],
    climb: ["\u26F0\uFE0F vert", "\uD83E\uDDB5 climbing legs", "\uD83D\uDCAA torque"],
    speed: ["\u26A1 speed", "\uD83C\uDFC3 rhythm", "\uD83D\uDCC9 splits"],
    consistency: ["\uD83D\uDCC6 routine", "\uD83D\uDD01 repeatability", "\uD83E\uDDE0 discipline"],
    mix: ["\uD83E\uDDE9 balance", "\uD83C\uDFAF focus", "\uD83D\uDD04 variety"],
    heart: ["\u2764\uFE0F effort signal", "\uD83D\uDD25 high load", "\uD83D\uDC8A recovery"],
};

const TIER_CHIPS: Record<HeroTier, string[]> = {
    starter: ["\uD83C\uDF31 building", "\uD83E\uDDF1 foundation", "\uD83D\uDD01 keep rolling"],
    solid: ["\u2705 locked in", "\uD83D\uDCC8 trending up", "\uD83C\uDFAF on plan"],
    big: ["\uD83D\uDD25 big signal", "\uD83D\uDE80 breakthrough", "\uD83E\uDDE8 standout"],
    elite: ["\uD83D\uDC51 elite day", "\uD83E\uDDE8 monster effort", "\uD83D\uDD25 peak signal"],
};

function contextualizeWowCopy(item: WowItem, base: WowCopy): WowCopy {
    const theme = getWowTheme(item.id);
    const tier = getHeroTier(item);
    const flavor = getActivityFlavor(item);

    return {
        line1: buildContextualLine1(item, base.line1, tier, flavor),
        line2: buildContextualLine2(item, base.line2, theme, tier, flavor),
        chips: buildContextualChips(item, base.chips, theme, tier, flavor),
        footer: buildContextualFooter(item, base.footer, theme, tier, flavor),
    };
}

function buildContextualLine1(
    item: WowItem,
    baseLine1: string,
    tier: HeroTier,
    flavor: ActivityFlavor | null
): string {
    if (!flavor || !ACTIVITY_DRIVEN_IDS.has(item.id)) return baseLine1;

    const tierLead =
        tier === "elite" ? "Top-tier"
            : tier === "big" ? "Big"
                : tier === "solid" ? "Strong"
                    : "Solid";

    return pickForItem(item, "line1", [
        baseLine1,
        `${tierLead} ${flavor.label} signal today.`,
        tier === "elite"
            ? `That ${flavor.label} effort was serious business.`
            : tier === "big"
                ? `That ${flavor.label} block moved the needle.`
                : tier === "solid"
                    ? `Clean ${flavor.label} work. Keep it repeatable.`
                    : `Good ${flavor.label} rep. Keep layering them.`,
    ]);
}

function buildContextualLine2(
    item: WowItem,
    baseLine2: string,
    theme: WowTheme,
    tier: HeroTier,
    flavor: ActivityFlavor | null
): string {
    const activity = flavor?.label ?? "session";
    const anchor =
        tier === "elite" ? "Peak-load signal."
            : tier === "big" ? "High-impact signal."
                : tier === "solid" ? "Solid progress signal."
                    : "Foundational progress signal.";

    switch (theme) {
        case "speed":
            return pickForItem(item, "line2-speed", [
                `${anchor} Keep easy ${activity} days truly easy so speed can stick.`,
                `This ${activity} pace gains value when quality stays controlled and repeatable.`,
                `One sharp ${activity} day plus smooth recovery beats chasing pace every day.`,
            ]);
        case "distance":
            return pickForItem(item, "line2-distance", [
                `${anchor} Long ${activity} volume compounds when fueling starts early.`,
                `Stacking steady ${activity} distance is how endurance quietly jumps levels.`,
                `Let this volume breathe with an easier follow-up ${activity} day.`,
            ]);
        case "climb":
            return pickForItem(item, "line2-climb", [
                `${anchor} Big vert from ${activity} work needs real recovery to convert into strength.`,
                `Climbing gains stick when hard elevation days alternate with smoother ${activity} sessions.`,
                `Use this vert signal as a springboard, not an excuse to overcook the next day.`,
            ]);
        case "consistency":
            return pickForItem(item, "line2-consistency", [
                `${anchor} Protect a minimum-day habit so routine survives busy weeks.`,
                `Consistency compounds fastest when the plan stays simple and repeatable.`,
                `Momentum comes from showing up on ordinary days, not perfect days.`,
            ]);
        case "mix":
            return pickForItem(item, "line2-mix", [
                `${anchor} Your blend is building a resilient all-around engine.`,
                `Keep one anchor sport and one support sport to balance stress well.`,
                `Variety is working here, as long as key sessions stay intentional.`,
            ]);
        case "heart":
            return pickForItem(item, "line2-heart", [
                `${anchor} High cardiac load pays off when easy days stay genuinely easy.`,
                `Use this effort signal to calibrate intensity, not to redline every session.`,
                `Heart-rate highs adapt best when sleep, fuel, and recovery are non-negotiable.`,
            ]);
        case "effort":
        default:
            if (ACTIVITY_DRIVEN_IDS.has(item.id) && flavor) {
                return pickForItem(item, "line2-effort-activity", [
                    `${anchor} ${capitalizeWord(activity)} consistency is now the multiplier.`,
                    `Keep this ${activity} quality repeatable and the fitness keeps stacking.`,
                    `Big days matter most when tomorrow's ${activity} load stays controlled.`,
                ]);
            }
            return pickForItem(item, "line2-effort-generic", [
                baseLine2,
                `${anchor} Repeatable effort beats occasional hero days.`,
                `Treat this as a marker, then build the next block with control.`,
            ]);
    }
}

function buildContextualFooter(
    item: WowItem,
    baseFooter: string,
    theme: WowTheme,
    tier: HeroTier,
    flavor: ActivityFlavor | null
): string {
    const activity = flavor?.label ?? "session";
    const activityHint = flavor?.hint ?? "protect recovery so tomorrow stays consistent";

    switch (theme) {
        case "speed":
            return pickForItem(item, "footer-speed", [
                `Hint: Keep one controlled speed touch in your ${activity} week.`,
                tier === "elite"
                    ? `Hint: Peak ${activity} speed day - prioritize sleep and fueling tonight.`
                    : `Hint: Leave one gear in reserve on the next hard ${activity} effort.`,
                `Hint: ${activityHint}.`,
            ]);
        case "distance":
            return pickForItem(item, "footer-distance", [
                `Hint: Start fueling earlier on long ${activity} days.`,
                `Hint: Use an easy recovery day after big ${activity} volume spikes.`,
                `Hint: ${baseFooter.replace(/\.$/, "")}, then keep the next build controlled.`,
            ]);
        case "climb":
            return pickForItem(item, "footer-climb", [
                `Hint: Pair heavy vert with low-intensity movement the next day.`,
                `Hint: Climbing gains stick best when strength and recovery stay balanced.`,
                `Hint: ${activityHint}.`,
            ]);
        case "consistency":
            return pickForItem(item, "footer-consistency", [
                `Hint: Keep a five-minute minimum session rule for busy days.`,
                `Hint: Build streaks with repeatable effort, not maximal effort.`,
                `Hint: One extra easy day per week can raise consistency fast.`,
            ]);
        case "mix":
            return pickForItem(item, "footer-mix", [
                `Hint: Rotate stress types to stay durable across the block.`,
                `Hint: Keep one primary focus while preserving some variety.`,
                `Hint: Balance intensity between sports instead of stacking hard days.`,
            ]);
        case "heart":
            return pickForItem(item, "footer-heart", [
                `Hint: High-HR sessions need true zone-2 follow-up to adapt well.`,
                tier === "elite"
                    ? `Hint: Treat this as a peak signal and prioritize recovery quality.`
                    : `Hint: Use HR trends to guide effort, not to chase numbers.`,
                `Hint: ${activityHint}.`,
            ]);
        case "effort":
        default:
            return pickForItem(item, "footer-effort", [
                `Hint: ${activityHint}.`,
                `Hint: Keep next-session intensity slightly lower to absorb this work.`,
                `Hint: ${baseFooter.replace(/\.$/, "")} while keeping recovery intentional.`,
            ]);
    }
}

function buildContextualChips(
    item: WowItem,
    baseChips: string[],
    theme: WowTheme,
    tier: HeroTier,
    flavor: ActivityFlavor | null
): string[] {
    const chip1 = pickForItem(item, "chip-theme", compactChips([baseChips[0], ...THEME_CHIPS[theme]]));
    const chip2 = pickForItem(
        item,
        "chip-activity",
        compactChips([flavor?.chip, baseChips[1], "\uD83E\uDDE0 intent", "\uD83E\uDDFE execution"])
    );
    const chip3 = pickForItem(item, "chip-tier", compactChips([baseChips[2], ...TIER_CHIPS[tier]]));

    const out: string[] = [];
    for (const chip of [chip1, chip2, chip3]) {
        if (chip && !out.includes(chip)) out.push(chip);
    }
    for (const fallback of ["\uD83D\uDCAA effort", "\uD83E\uDDE0 focus", "\u2705 done"]) {
        if (out.length >= 3) break;
        if (!out.includes(fallback)) out.push(fallback);
    }
    return out.slice(0, 3);
}

function getWowTheme(id: string): WowTheme {
    switch (id) {
        case "farthest":
        case "avg-session":
        case "fields":
        case "marathons":
        case "laps":
        case "earth":
        case "moon":
            return "distance";
        case "biggest-climb":
        case "climb-density":
        case "eiffel":
        case "floors":
        case "burj":
        case "empire":
        case "ebc":
            return "climb";
        case "fastest-pace":
        case "best-5k":
        case "best-10k":
        case "avg-pace":
            return "speed";
        case "streak":
        case "active-days":
        case "time-of-day":
        case "busiest-week":
            return "consistency";
        case "dominant-sport":
        case "variety":
            return "mix";
        case "avg-hr":
        case "max-hr":
            return "heart";
        default:
            return "effort";
    }
}

function getHeroTier(item: WowItem): HeroTier {
    switch (item.id) {
        case "biggest-effort":
            return tierByThreshold(parseDurationSeconds(item.value) / 60, 30, 90, 180);
        case "farthest":
            return tierByThreshold(parseDistanceMiles(item.value), 6, 13, 26);
        case "biggest-climb":
            return tierByThreshold(parseElevationMeters(item.value), 400, 1000, 2200);
        case "fastest-pace":
        case "best-5k":
        case "best-10k":
            return paceTierFromValue(item.value);
        case "streak":
            return tierByThreshold(parseIntSafe(item.value), 3, 10, 21);
        case "active-days":
            return tierByThreshold(parseActiveDaysPct(item), 45, 65, 85);
        case "avg-pace":
            return tierByThreshold(parseSpeedKph(item.value), 9, 16, 28);
        case "avg-session":
            return tierByThreshold(parseDistanceMiles(item.value), 2, 5, 10);
        case "climb-density":
            return tierByThreshold(parseClimbDensityMPerKm(item.value), 20, 50, 90);
        case "dominant-sport":
            return tierByThreshold(parsePct(item.value), 40, 60, 80);
        case "variety":
            return tierByThreshold(parseIntSafe(item.value), 2, 4, 6);
        case "busiest-week":
            return tierByThreshold(parseRatioLeft(item.value), 3, 5, 7);
        case "longest-week":
            return tierByThreshold(parseDistanceMiles(item.value), 20, 40, 70);
        case "most-active-day": {
            const miles = parseDistanceMiles(item.value);
            if (miles > 0) return tierByThreshold(miles, 5, 10, 20);
            const minutes = parseDurationSeconds(item.secondaryValue || item.value) / 60;
            return tierByThreshold(minutes, 45, 120, 240);
        }
        case "time-of-day":
            return tierByThreshold(parsePct(item.secondaryValue || item.value), 30, 45, 60);
        case "avg-hr":
            return tierByThreshold(parseNumber(item.value), 135, 155, 172);
        case "max-hr":
            return tierByThreshold(parseNumber(item.value), 165, 182, 195);
        case "eiffel":
            return tierByThreshold(parseFactor(item.value), 1.5, 3, 6);
        case "floors":
            return tierByThreshold(parseIntSafe(item.value), 600, 2000, 5000);
        case "fields":
            return tierByThreshold(parseIntSafe(item.value), 300, 1000, 2000);
        case "marathons":
            return tierByThreshold(parseFactor(item.value), 1, 3, 8);
        case "laps":
            return tierByThreshold(parseIntSafe(item.value), 20, 80, 200);
        case "earth":
            return tierByThreshold(parsePct(item.value), 1, 20, 60);
        case "moon":
            return tierByThreshold(parsePct(item.value), 1, 10, 50);
        case "burj":
            return tierByThreshold(parseFactor(item.value), 1, 2, 4);
        case "empire":
            return tierByThreshold(parseFactor(item.value), 1, 2, 4);
        case "ebc":
            return tierByThreshold(parseFactor(item.value), 0.5, 1, 2);
        default:
            return tierByThreshold(parseNumber(item.value), 10, 30, 80);
    }
}

function getActivityFlavor(item: WowItem): ActivityFlavor | null {
    const source = `${item.activityType || ""} ${item.subtitle || ""}`.toLowerCase();
    if (!source.trim()) return null;

    if (/(trailrun|trail run|trail-running)/.test(source)) {
        return {
            label: "trail run",
            cue: "climb rhythm",
            chip: "\uD83C\uDFC3\u26F0\uFE0F trail legs",
            hint: "let your next climb-focused session stay aerobic",
        };
    }
    if (/(run|jog|virtualrun)/.test(source)) {
        return {
            label: "run",
            cue: "stride rhythm",
            chip: "\uD83C\uDFC3 run focus",
            hint: "keep the next run easy to absorb this load",
        };
    }
    if (/(ride|bike|cycling|cycle|gravel|mountainbike|mtb|ebike|virtualride|handcycle|velomobile)/.test(source)) {
        return {
            label: "ride",
            cue: "pedal rhythm",
            chip: "\uD83D\uDEB4 bike flow",
            hint: "spin easy tomorrow so this bike work can stick",
        };
    }
    if (/(swim|openwater|pool)/.test(source)) {
        return {
            label: "swim",
            cue: "stroke rhythm",
            chip: "\uD83C\uDFCA swim form",
            hint: "use a relaxed technique set next to lock this in",
        };
    }
    if (/\bhike\b/.test(source)) {
        return {
            label: "hike",
            cue: "climbing rhythm",
            chip: "\uD83E\uDD7E trail power",
            hint: "keep the next hike steady and conversational",
        };
    }
    if (/\bwalk\b/.test(source)) {
        return {
            label: "walk",
            cue: "steady rhythm",
            chip: "\uD83D\uDEB6 active base",
            hint: "keep frequency high and intensity easy",
        };
    }
    if (/(ski|snowboard|snowshoe|nordic|alpine)/.test(source)) {
        return {
            label: "ski session",
            cue: "glide rhythm",
            chip: "\u26F7\uFE0F snow legs",
            hint: "use an easy flush day so this effort can convert",
        };
    }
    if (/(strength|weight|workout|crossfit|hiit|rowing|row|pilates|yoga)/.test(source)) {
        return {
            label: "training session",
            cue: "movement quality",
            chip: "\uD83C\uDFCB\uFE0F gym focus",
            hint: "keep tomorrow lower stress and prioritize quality sleep",
        };
    }

    return {
        label: "session",
        cue: "movement quality",
        chip: "\uD83D\uDD39 skill reps",
        hint: "keep the next session smooth and controlled",
    };
}

function tierByThreshold(value: number, solid: number, big: number, elite: number): HeroTier {
    if (!isFinite(value) || value <= 0) return "starter";
    if (value >= elite) return "elite";
    if (value >= big) return "big";
    if (value >= solid) return "solid";
    return "starter";
}

function paceTierFromValue(value: string): HeroTier {
    const paceMinPerKm = parsePaceMinutesPerKm(value);
    if (!paceMinPerKm) return "starter";
    if (paceMinPerKm <= 4.3) return "elite";
    if (paceMinPerKm <= 5.2) return "big";
    if (paceMinPerKm <= 6.3) return "solid";
    return "starter";
}

function parsePaceMinutesPerKm(v: string): number | null {
    const m = String(v).toLowerCase().match(/(\d{1,2}):(\d{2})\s*\/\s*(km|mi)\b/);
    if (!m) return null;
    const minutes = Number(m[1]);
    const seconds = Number(m[2]);
    const unit = m[3];
    if (!isFinite(minutes) || !isFinite(seconds)) return null;
    const totalMin = minutes + seconds / 60;
    if (unit === "mi") return totalMin / 1.609344;
    return totalMin;
}

function parseSpeedKph(v: string): number {
    const s = String(v).toLowerCase();
    const n = parseFloat(s.replace(/[^0-9.]+/g, " ").trim().split(" ")[0] || "0");
    if (!isFinite(n)) return 0;
    if (s.includes("mph")) return n * 1.609344;
    return n;
}

function parseElevationMeters(v: string): number {
    const s = String(v).toLowerCase();
    const n = parseFloat(s.replace(/[^0-9.]+/g, " ").trim().split(" ")[0] || "0");
    if (!isFinite(n)) return 0;
    if (s.includes("ft")) return n * 0.3048;
    return n;
}

function parseClimbDensityMPerKm(v: string): number {
    const s = String(v).toLowerCase();
    const n = parseFloat(s.replace(/[^0-9.]+/g, " ").trim().split(" ")[0] || "0");
    if (!isFinite(n)) return 0;
    if (s.includes("ft/mi")) return (n * 0.3048) / 1.609344;
    if (s.includes("m/mi")) return n / 1.609344;
    if (s.includes("ft/km")) return n * 0.3048;
    return n; // m/km default
}

function parseRatioLeft(v: string): number {
    const m = String(v).match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const left = Number(m[1]);
    return isFinite(left) ? left : 0;
}

function parseActiveDaysPct(item: WowItem): number {
    const pctInSubtitle = parsePct(item.subtitle || "");
    if (pctInSubtitle > 0) return pctInSubtitle;

    const m = String(item.value).match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const active = Number(m[1]);
    const total = Number(m[2]);
    if (!isFinite(active) || !isFinite(total) || total <= 0) return 0;
    return (active / total) * 100;
}

function compactChips(values: Array<string | null | undefined>): string[] {
    return values.filter((v): v is string => Boolean(v && v.trim()));
}

function pickForItem(item: WowItem, salt: string, options: string[]): string {
    const cleaned = options.filter((x) => Boolean(x && x.trim()));
    if (cleaned.length === 0) return "";

    const seed = [
        item.id,
        item.value,
        item.secondaryValue || "",
        item.subtitle || "",
        item.activityType || "",
        salt,
    ].join("|");
    const index = hashSeed(seed) % cleaned.length;
    return cleaned[index];
}

function hashSeed(input: string): number {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function capitalizeWord(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* ─── Parsers ─── */

function parseDurationSeconds(s: string): number {
    const str = (s || "").toLowerCase();
    const h = matchNum(str, /(\d+)\s*h/);
    const m = matchNum(str, /(\d+)\s*m/);
    const sec = matchNum(str, /(\d+)\s*s/);
    return h * 3600 + m * 60 + sec;
}

function matchNum(str: string, re: RegExp): number {
    const m = str.match(re);
    return m ? Number(m[1] || 0) : 0;
}

function parseDistanceMiles(v: string): number {
    const s = String(v).toLowerCase();
    const n = parseFloat(s.replace(/[^0-9.]+/g, " ").trim().split(" ")[0] || "0");
    if (!isFinite(n)) return 0;
    if (s.includes("mi")) return n;
    if (s.includes("km")) return n * 0.621371;
    if (s.includes(" m")) return n * 0.000621371;
    return n; // unknown unit, treat as miles
}

function parseFactor(v: string): number {
    const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : 0;
}

function parsePct(v: string): number {
    const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
    return isFinite(n) ? Math.max(0, n) : 0;
}

function parseIntSafe(v: string): number {
    const n = parseInt(String(v).replace(/\D/g, ""), 10);
    return isFinite(n) ? n : 0;
}

function parseNumber(v: string): number {
    const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : 0;
}
