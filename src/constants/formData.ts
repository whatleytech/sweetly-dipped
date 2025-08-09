import type { PackageOption, TreatOption, TimeSlots } from "../types/formTypes";

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
  Monday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Tuesday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Wednesday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Thursday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Friday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Saturday: ["9:00 AM - 12:00 PM"],
  Sunday: ["3:00 PM - 7:00 PM"],
};

export const DAY_MAP: Array<keyof typeof TIME_SLOTS> = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
