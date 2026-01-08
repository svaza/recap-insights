import { useEffect, useState } from "react";
import { getFromStorage, setStorage, clearCacheByPrefix } from "../utils/storageCache";

type AthleteProfile = {
    firstName: string;
    lastName: string;
    fullName: string;
};

type AthleteApiResponse =
    | { connected: false }
    | { connected: true; profile: AthleteProfile };

const CACHE_KEY = "recapcache:profile";

export function useAthleteProfile() {
    const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(() => {
        // Try to load from cache on initial render
        return getFromStorage<AthleteProfile>(CACHE_KEY);
    });

    useEffect(() => {
        // Skip API call if we have cached data
        const cachedData = getFromStorage<AthleteProfile>(CACHE_KEY);
        if (cachedData) {
            return;
        }

        let cancelled = false;
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/me");
                const data = (await res.json()) as AthleteApiResponse;
                
                if (cancelled) return;

                if (data.connected) {
                    setAthleteProfile(data.profile);
                    setStorage(CACHE_KEY, data.profile);
                } else {
                    // Clear all cache if not connected
                    setAthleteProfile(null);
                    clearCacheByPrefix("recapcache:");
                }
            } catch (e) {
                // Silently fail - profile is optional
            }
        };
        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, []);

    return athleteProfile;
}
