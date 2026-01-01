export type RangeType = "rolling" | "calendar";
export type CalendarUnit = "month" | "year";

export type RecapQuery =
  | { type: "rolling"; days: number; }
  | { type: "calendar"; unit: CalendarUnit; offset?: number; };

export type ActivityItem = {
  id: number;
  name: string;
  type: string;
  startDateUtc: string;
  distanceM: number;
  movingTimeSec: number;
  elevationM: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
};


export type RecapRawData = {
  range: {
    startUtc: string;
    endUtc: string;
  };
  activities: ActivityItem[];
};

export type RecapApiResponse =
  | { connected: false }
  | { connected: true; data: RecapRawData }
  | { connected: true; error: string };
