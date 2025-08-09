import type {
  PackageOption,
  TreatOption,
  TimeSlots,
  UnavailablePeriod,
} from "../types/formTypes";

export const PACKAGE_OPTIONS: PackageOption[] = [
  { id: "small", label: "Small (3 dozen – 36 treats)", price: "$110" },
  { id: "medium", label: "Medium (5 dozen – 60 treats)", price: "$180" },
  { id: "large", label: "Large (8 dozen – 96 treats)", price: "$280" },
  {
    id: "xl",
    label: "XL (12 dozen – 144 treats)",
    price: "$420",
    description: "Requires at least one month notice",
  },
  { id: "by-dozen", label: "No package — order by the dozen" },
];

export const TREAT_OPTIONS: TreatOption[] = [
  { key: "riceKrispies", label: "Chocolate covered Rice Krispies", price: 40 },
  { key: "oreos", label: "Chocolate covered Oreos", price: 30 },
  { key: "pretzels", label: "Chocolate dipped pretzels", price: 30 },
  {
    key: "marshmallows",
    label: "Chocolate covered marshmallow pops",
    price: 40,
  },
];

export const QUANTITIES = [0, 1, 2, 3, 4] as const;

export const TIME_SLOTS: TimeSlots = {
  Monday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 9, minute: 0, timeOfDay: "morning" },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 8, minute: 0, timeOfDay: "evening" },
    },
  ],
  Tuesday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 9, minute: 0, timeOfDay: "morning" },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 8, minute: 0, timeOfDay: "evening" },
    },
  ],
  Wednesday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 9, minute: 0, timeOfDay: "morning" },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 8, minute: 0, timeOfDay: "evening" },
    },
  ],
  Thursday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 9, minute: 0, timeOfDay: "morning" },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 8, minute: 0, timeOfDay: "evening" },
    },
  ],
  Friday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 9, minute: 0, timeOfDay: "morning" },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 8, minute: 0, timeOfDay: "evening" },
    },
  ],
  Saturday: [
    {
      startTime: { hour: 9, minute: 0, timeOfDay: "morning" },
      endTime: { hour: 12, minute: 0, timeOfDay: "morning" },
    },
  ],
  Sunday: [
    {
      startTime: { hour: 3, minute: 0, timeOfDay: "evening" },
      endTime: { hour: 7, minute: 0, timeOfDay: "evening" },
    },
  ],
};

export const UNAVAILABLE_PERIODS: UnavailablePeriod[] = [
  {
    startDate: "2025-08-28",
    endDate: "2025-09-03",
    reason: "Vacation",
  },
  {
    startDate: "2025-10-09",
    endDate: "2025-10-13",
    reason: "Business trip",
  },
  {
    startDate: "2025-11-15",
    // No endDate - single day unavailability
    reason: "Personal appointment",
  },
];
