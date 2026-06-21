import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarRadiusAxis, Radar, LineChart, Line, Legend, Cell, PieChart, Pie
} from "recharts";
import {
  Leaf, Wind, Droplets, Zap, Trash2, Thermometer, MapPin, ArrowRight,
  ChevronRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Award, Trophy, Users, Building2, TreePine, Bike, Sun, Recycle,
  FileText, Download, Sparkles, Target, Activity, Eye, ShieldCheck,
  ChevronLeft, Plus, Minus, Cloud, CloudRain, Snowflake, X, Menu,
  BarChart3, Map as MapIcon, Star, Medal, GraduationCap, Info,
  Layers, Globe2, Flame, Lock, ClipboardList, Gauge, ArrowUpRight,
  ArrowDownRight, Crosshair, CalendarClock, Wallet
} from "lucide-react";

/* =========================================================================
   ECOLENS AI — School Sustainability Intelligence Platform
   Design system: "Field Instrument"
   - Deep forest page ground, sage/teal signal colors, warm sand surfaces
   - Space Grotesk (display) + Inter (body) + JetBrains Mono (data/readouts)
   - Signature: the Hidden Footprint Scanner — a radar-sweep reveal
   ========================================================================= */

const FONT_LINK_ID = "ecolens-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------------------------- THEME TOKENS ---------------------------- */
const T = {
  bg: "#0A1612",
  bgAlt: "#111E18",
  surface: "#F2EFE6",
  surfaceDim: "#E8E3D3",
  sage: "#5A8F69",
  sageLight: "#7FB089",
  teal: "#1B998B",
  tealLight: "#3FC1AC",
  amber: "#E8A33D",
  amberLight: "#F2BE6E",
  coral: "#E2654F",
  ink: "#2C3E50",
  cream: "#F2EFE6",
  mist: "rgba(242,239,230,0.65)",
  mistDim: "rgba(242,239,230,0.4)",
  line: "rgba(0,0,0,0.1)",
};

const CATEGORY_META = {
  transportation: { label: "Transportation", icon: Bike, color: T.coral },
  energy: { label: "Energy", icon: Zap, color: T.amber },
  waste: { label: "Waste", icon: Trash2, color: "#9B6FE0" },
  water: { label: "Water", icon: Droplets, color: T.teal },
  heating: { label: "Heat & Cooling", icon: Thermometer, color: T.sage },
};

/* ---------------------------- MOCK AI ENGINE ---------------------------- */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function runFootprintEngine(school) {
  const seed = hashSeed(
    `${school.name}|${school.city}|${school.country}|${school.students}|${school.area}|${school.greenCover}|${school.buildings}|${school.busPct}|${school.metroPct}|${school.walkCyclePct}|${school.carPct}|${school.acHours}|${school.waste}|${school.irrigation}|${school.irrigationType}|${school.waterSource}|${school.waterMetering}|${school.waterLitersPerStudent}`
  );
  const rand = seededRand(seed);

  const students = Number(school.students) || 500;
  const area = Number(school.area) || 10000;
  const greenCover = Number(school.greenCover) ?? 20;
  const buildings = Number(school.buildings) || 4;

  const busPctRaw = clamp(Number(school.busPct) || 0, 0, 100);
  const metroPctRaw = clamp(Number(school.metroPct) || 0, 0, 100);
  const walkCyclePctRaw = clamp(Number(school.walkCyclePct) || 0, 0, 100);
  const carPctRaw = clamp(Number(school.carPct) || 0, 0, 100);
  const transportTotal = busPctRaw + metroPctRaw + walkCyclePctRaw + carPctRaw || 1;
  const busPct = (busPctRaw / transportTotal) * 100;
  const metroPct = (metroPctRaw / transportTotal) * 100;
  const walkCyclePct = (walkCyclePctRaw / transportTotal) * 100;
  const carPct = (carPctRaw / transportTotal) * 100;

  const acHours = clamp(Number(school.acHours) || 0, 0, 24);
  const wasteFactor = { low: 0.25, medium: 0.55, high: 0.9 }[school.waste] ?? 0.55;

  const irrigationFactor =
    school.irrigation === "yes"
      ? { manual: 0.85, sprinkler: 0.6, drip: 0.3 }[school.irrigationType] ?? 0.65
      : 0.15;
  const sourceFactor = { municipal: 0.6, borewell: 0.75, recycled: 0.25 }[school.waterSource] ?? 0.55;
  const meteringFactor = school.waterMetering === "yes" ? 0.25 : 0.7;
  const litersPerStudent = Number(school.waterLitersPerStudent);
  const usageFactor = litersPerStudent ? clamp(litersPerStudent / 60, 0.2, 1.3) : 0.55;
  const waterFactor = clamp(
    irrigationFactor * 0.35 + sourceFactor * 0.25 + meteringFactor * 0.2 + usageFactor * 0.2,
    0.1, 1
  );

  const studentDensity = Math.min(1, students / (area / 8));
  const buildingLoad = Math.min(1, buildings / 12);
  const acLoad = acHours / 24;

  const raw = {
    transportation: clamp(carPct * 0.85 + studentDensity * 15 + rand() * 8, 5, 98),
    energy: clamp(acLoad * 65 + buildingLoad * 18 + (1 - greenCover / 100) * 10 + rand() * 10, 5, 98),
    waste: clamp(wasteFactor * 65 + studentDensity * 15 + rand() * 12, 5, 98),
    water: clamp(waterFactor * 75 + buildingLoad * 12 + rand() * 10, 5, 98),
    heating: clamp(buildingLoad * 40 + acLoad * 25 + (1 - greenCover / 100) * 22 + rand() * 12, 5, 98),
  };

  const confidence = {
    transportation: clamp(62 + (busPct + metroPct + walkCyclePct > 0 ? 22 : 0) + rand() * 10, 40, 96),
    energy: clamp(58 + (school.acHours !== "" && school.acHours != null ? 20 : 0) + rand() * 12, 40, 93),
    waste: clamp(60 + (school.waste ? 18 : 0) + rand() * 10, 40, 93),
    water: clamp(55 + (school.irrigation ? 12 : 0) + (school.waterSource ? 12 : 0) + (school.waterMetering ? 8 : 0) + rand() * 8, 40, 95),
    heating: clamp(50 + (greenCover != null ? 15 : 0) + rand() * 14, 35, 88),
  };

  const sorted = Object.entries(raw).sort((a, b) => b[1] - a[1]);
  const hiddenKey = sorted[0][0];
  const hiddenValue = sorted[0][1];
  const secondKey = sorted[1][0];

  const componentScores = {
    transportation: Math.round(100 - raw.transportation),
    energy: Math.round(100 - raw.energy),
    waste: Math.round(100 - raw.waste),
    water: Math.round(100 - raw.water),
    campus: clamp(Math.round(greenCover * 1.3 + (1 - buildingLoad) * 25), 5, 98),
  };

  const overallScore = Math.round(
    componentScores.transportation * 0.22 +
      componentScores.energy * 0.22 +
      componentScores.waste * 0.18 +
      componentScores.water * 0.18 +
      componentScores.campus * 0.2
  );

  const rawTotal = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const contribution = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, (v / rawTotal) * 100])
  );
  const contributionRounded = roundToSum(contribution, 100);

  const annualImpactTons = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Math.round((v / 100) * (students / 40) * 10) / 10])
  );
  const totalAnnualImpactTons = Math.round(Object.values(annualImpactTons).reduce((a, b) => a + b, 0) * 10) / 10;

  const severity = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Math.min(5, Math.max(1, Math.ceil(v / 20)))])
  );

  const irrigationLabel = school.irrigation === "yes"
    ? `${{ manual: "manually watered", sprinkler: "sprinkler-irrigated", drip: "drip-irrigated" }[school.irrigationType] || "irrigated"} grounds`
    : "no formal irrigation system";
  const sourceLabel = { municipal: "municipal supply", borewell: "borewell / groundwater", recycled: "recycled greywater" }[school.waterSource] || "an unspecified source";

  const explanations = {
    transportation: `${Math.round(carPct)}% of daily journeys are by private car, against just ${Math.round(busPct + metroPct + walkCyclePct)}% combined across transit options — combined with a student grid density of ${students} pupils, this magnifies avoidable tracking parameters.`,
    energy: `Cooling systems operate around ${acHours} hours/day across ${buildings} discrete facilities, with a restricted canopy index (${greenCover}%), causing structural thermal fatigue.`,
    waste: `Current campus handling patterns reflect "${school.waste || "medium"}" diversion intensity with minimal multi-stream segregation loops.`,
    water: `The site features ${irrigationLabel} drawing from ${sourceLabel} with ${school.waterMetering === "yes" ? "monitored parameters" : "unmetered lines, amplifying leakage coefficients"}.`,
    heating: `Infrastructure layouts and ${acHours} hours of operational conditioning match standard grid patterns but miss local passive insulation metrics.`,
  };

  return {
    seed, raw, confidence, componentScores, overallScore, hiddenKey,
    hiddenValue: Math.round(hiddenValue), secondKey, explanation: explanations[hiddenKey],
    explanations, contribution: contributionRounded, annualImpactTons, totalAnnualImpactTons, severity,
    students, greenCover, buildings
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function roundToSum(obj, targetSum) {
  const entries = Object.entries(obj);
  const floored = entries.map(([k, v]) => [k, Math.floor(v), v - Math.floor(v)]);
  let remainder = targetSum - floored.reduce((sum, [, f]) => sum + f, 0);
  const sortedByRemainder = [...floored].sort((a, b) => b[2] - a[2]);
  const result = Object.fromEntries(floored.map(([k, f]) => [k, f]));
  for (let i = 0; i < remainder; i++) {
    const key = sortedByRemainder[i % sortedByRemainder.length][0];
    result[key] += 1;
  }
  return result;
}

function formatArea(sqm) {
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(1)} ha`;
  return `${sqm} m²`;
}

/* ---------------------------- RECOMMENDATIONS & SDG METADATA ---------------------------- */
const SDG_META = {
  6: { label: "Clean Water & Sanitation", color: "#26BDE2", desc: "Ensure availability and sustainable management of water." },
  7: { label: "Affordable & Clean Energy", color: "#FCC30B", desc: "Ensure access to affordable, reliable, sustainable energy." },
  11: { label: "Sustainable Cities & Communities", color: "#FB9D24", desc: "Make environments inclusive, safe, resilient, and sustainable." },
  12: { label: "Responsible Consumption & Production", color: "#D1963F", desc: "Ensure sustainable consumption and production patterns." },
  13: { label: "Climate Action", color: "#3F7E44", desc: "Take urgent action to combat climate change and its impacts." },
};

const ACTION_LIBRARY = [
  {
    id: "energy-audit",
    name: "Comprehensive Energy Audit",
    category: "energy",
    icon: Activity,
    impact: 4,
    effort: 1,
    desc: "Map localized electrical or structural leakage loops inside high-load building configurations.",
    scoreEffect: { energy: 6, heating: 2 },
    phase: "immediate",
    sdgs: [7, 12],
    difficulty: "Low",
    cost: "Low",
    benefit: "Reduces structural operational cost overhead baseline.",
    forecast: { score: 3, metric: "Energy Footprint", metricChange: -6 },
  },
  {
    id: "waste-audit",
    name: "Multi-Stream Waste Segregation",
    category: "waste",
    icon: Trash2,
    impact: 4,
    effort: 2,
    desc: "Deploy a standardized 3-stream container flow with weekly volume monitoring protocols.",
    scoreEffect: { waste: 8 },
    phase: "immediate",
    sdgs: [11, 12],
    difficulty: "Low",
    cost: "Low",
    benefit: "Prevents mixed recycling contamination parameters.",
    forecast: { score: 5, metric: "Waste Footprint", metricChange: -15 },
  },
  {
    id: "water-fix",
    name: "Systemic Water Leak Inspection",
    category: "water",
    icon: Droplets,
    impact: 5,
    effort: 2,
    desc: "Examine subsurface plumbing connections and irrigation hubs for flow pressure variances.",
    scoreEffect: { water: 9 },
    phase: "immediate",
    sdgs: [6],
    difficulty: "Low",
    cost: "Low",
    benefit: "Identifies lost volume without secondary cap spending.",
    forecast: { score: 4, metric: "Water Consumption", metricChange: -12 },
  },
  {
    id: "led",
    name: "Full-Campus LED Transition",
    category: "energy",
    icon: Sun,
    impact: 5,
    effort: 2,
    desc: "Convert remaining high-wattage custom fluorescent or terminal units to responsive low-draw LED setups.",
    scoreEffect: { energy: 10 },
    phase: "short",
    sdgs: [7, 13],
    difficulty: "Low",
    cost: "Medium",
    benefit: "Provides fixed structural baseline consumption reduction.",
    forecast: { score: 4, metric: "Energy Footprint", metricChange: -10 },
  },
  {
    id: "awareness",
    name: "Active Campus Resource Campaigns",
    category: "waste",
    icon: Users,
    impact: 3,
    effort: 1,
    desc: "Introduce modular educational modules to systematically reduce per-capita daily consumption factors.",
    scoreEffect: { waste: 4, water: 3, energy: 3 },
    phase: "short",
    sdgs: [11, 12],
    difficulty: "Low",
    cost: "Low",
    benefit: "Aligns population behavior patterns with building controls.",
    forecast: { score: 3, metric: "Sustainability Score", metricChange: 3 },
  },
  {
    id: "smart-hvac",
    name: "Smart Climate & Irrigation Controls",
    category: "energy",
    icon: Thermometer,
    impact: 6,
    effort: 3,
    desc: "Deploy automated occupancy scheduling across environmental arrays instead of continuous baselines.",
    scoreEffect: { energy: 11, heating: 7, water: 5 },
    phase: "short",
    sdgs: [6, 7, 13],
    difficulty: "Medium",
    cost: "Medium",
    benefit: "Mitigates overnight or weekend unneeded energy load loops.",
    forecast: { score: 6, metric: "Energy Footprint", metricChange: -14 },
  },
  {
    id: "rainwater",
    name: "Rainwater Harvesting Ingestion",
    category: "water",
    icon: CloudRain,
    impact: 7,
    effort: 5,
    desc: "Install high-capacity roof capture networks coupled with dynamic filtration storage for irrigation infrastructure.",
    scoreEffect: { water: 16 },
    phase: "medium",
    sdgs: [6, 13],
    difficulty: "Medium",
    cost: "Medium",
    benefit: "Offsets main municipality utility volume demand indexes.",
    forecast: { score: 7, metric: "Water Consumption", metricChange: -22 },
  },
  {
    id: "solar-feasibility",
    name: "Rooftop Solar Feasibility Study",
    category: "energy",
    icon: Sun,
    impact: 3,
    effort: 2,
    desc: "Analyze rooftop weight limits, sun angles, and electrical grid capacities ahead of panel purchase.",
    scoreEffect: { energy: 4 },
    phase: "medium",
    sdgs: [7, 13],
    difficulty: "Low",
    cost: "Low",
    benefit: "Prevents technical structural mistakes or capacity mismatches.",
    forecast: { score: 2, metric: "Energy Footprint", metricChange: -3 },
  },
  {
    id: "compost",
    name: "On-Site Composting Loop",
    category: "waste",
    icon: Recycle,
    impact: 6,
    effort: 3,
    desc: "Route solid organic cafeteria volume away from local landfills into aerobic campus stabilization hubs.",
    scoreEffect: { waste: 14 },
    phase: "medium",
    sdgs: [11, 12],
    difficulty: "Medium",
    cost: "Low",
    benefit: "Provides rich ground topsoil while avoiding waste transportation.",
    forecast: { score: 5, metric: "Waste Footprint", metricChange: -30 },
  },
  {
    id: "solar",
    name: "Full Rooftop Solar Array Integration",
    category: "energy",
    icon: Sun,
    impact: 9,
    effort: 7,
    desc: "Deploy crystalline silicon photovoltaic cells over high-load roof expanses to generate clean power.",
    scoreEffect: { energy: 20 },
    phase: "long",
    sdgs: [7, 13],
    difficulty: "High",
    cost: "High",
    benefit: "Supplies self-reliant peak energy tracking performance.",
    forecast: { score: 12, metric: "Carbon Emissions", metricChange: -18, secondaryMetric: "Energy Footprint", secondaryChange: -25 },
  },
  {
    id: "green-roof",
    name: "Extensive Vegetated Roofing",
    category: "heating",
    icon: TreePine,
    impact: 6,
    effort: 6,
    desc: "Convert unused exposed flat infrastructure zones into living plant insulation covers.",
    scoreEffect: { heating: 12, campus: 8 },
    phase: "long",
    sdgs: [11, 13],
    difficulty: "High",
    cost: "High",
    benefit: "Lowers structural surface heating and local peak runoff levels.",
    forecast: { score: 8, metric: "Heat Vulnerability", metricChange: -20 },
  },
  {
    id: "ev",
    name: "EV Transit Fleet Upgrades",
    category: "transportation",
    icon: Bike,
    impact: 8,
    effort: 7,
    desc: "Transition active school shuttles and service machines to pure electric powertrains with fast chargers.",
    scoreEffect: { transportation: 18 },
    phase: "long",
    sdgs: [11, 13],
    difficulty: "High",
    cost: "High",
    benefit: "Removes direct tailpipe emissions from local campus zones.",
    forecast: { score: 10, metric: "Carbon Emissions", metricChange: -16 },
  },
];

function buildRecommendations(engineResult) {
  return ACTION_LIBRARY.map((a) => {
    const relevance = engineResult.raw[a.category] ?? 50;
    const priority = relevance * 0.6 + a.impact * 6 - a.effort * 2;
    return { ...a, relevance, priority };
  }).sort((a, b) => b.priority - a.priority);
}

const ROADMAP_PHASES = [
  { key: "immediate", label: "Immediate Actions", window: "0–30 Days", color: T.coral },
  { key: "short", label: "Short-Term Actions", window: "1–3 Months", color: T.amber },
  { key: "medium", label: "Medium-Term Actions", window: "3–12 Months", color: T.teal },
  { key: "long", label: "Long-Term Actions", window: "1–3 Years", color: T.sage },
];

function buildRoadmap(recommendations) {
  return ROADMAP_PHASES.map((phase) => ({
    ...phase,
    actions: recommendations.filter((a) => a.phase === phase.key).sort((a, b) => b.priority - a.priority),
  }));
}

/* ---------------------------- SAMPLE DATA ---------------------------- */
const SAMPLE_SCHOOL = {
  name: "Riverside International School",
  city: "Doha",
  country: "Qatar",
  students: "1240",
  area: "42000",
  greenCover: "14",
  buildings: "6",
  busPct: "15",
  metroPct: "5",
  walkCyclePct: "10",
  carPct: "70",
  acHours: "11",
  waste: "medium",
  irrigation: "yes",
  irrigationType: "sprinkler",
  waterSource: "municipal",
  waterMetering: "no",
  waterLitersPerStudent: "55",
};

const BADGES = [
  { id: "carbon", name: "Carbon Reducer", desc: "Reduced simulation emissions or high transit efficiency achieved", icon: Bike },
  { id: "water", name: "Water Guardian", desc: "Implemented micro-drip or leak reduction matrices", icon: Droplets },
  { id: "waste", name: "Waste Warrior", desc: "Achieved full three-stream waste mitigation index", icon: Trash2 },
  { id: "campus", name: "Green Campus", desc: "Exceeded 35% ecological canopy index rating", icon: TreePine },
  { id: "champion", name: "Climate Champion", desc: "Overall performance metrics cross top 10% threshold", icon: Trophy },
];

const CLIMATE_REFERENCE = {
  Qatar: { temp: 38, humidity: 55, condition: "Clear / Arid", icon: Sun },
  default: { temp: 24, humidity: 60, condition: "Partly Cloudy", icon: Cloud },
  Norway: { temp: 12, humidity: 70, condition: "Overcast", icon: Cloud },
  Singapore: { temp: 30, humidity: 82, condition: "Humid / Showers", icon: CloudRain },
  Canada: { temp: 9, humidity: 65, condition: "Cool / Breezy", icon: Wind },
  "South Africa": { temp: 21, humidity: 58, condition: "Mild", icon: Sun },
  Australia: { temp: 26, humidity: 50, condition: "Sunny", icon: Sun },
  USA: { temp: 18, humidity: 60, condition: "Variable", icon: Cloud },
};

function getClimate(country) {
  return CLIMATE_REFERENCE[country] || CLIMATE_REFERENCE.default;
}

function getClimateZone(country) {
  const c = getClimate(country);
  if (c.temp >= 32) return "hot";
  if (c.humidity >= 78) return "humid";
  if (c.humidity <= 55 && c.temp >= 20) return "dry";
  if (c.condition.toLowerCase().includes("rain") || c.condition.toLowerCase().includes("shower")) return "rainy";
  return "temperate";
}

const CLIMATE_ZONE_META = {
  hot: { label: "Hot / Arid", icon: Sun, color: T.amber },
  humid: { label: "Humid Cluster", icon: CloudRain, color: T.teal },
  dry: { label: "Dry / Semi-Arid", icon: Sun, color: T.coral },
  rainy: { label: "High Precipitation", icon: CloudRain, color: T.teal },
  temperate: { label: "Temperate Zone", icon: Cloud, color: T.sageLight },
};

function getSizeCategory(students) {
  const n = Number(students) || 0;
  if (n < 400) return "Small";
  if (n < 1200) return "Medium";
  if (n < 2500) return "Large";
  return "Very Large";
}

/* ---------------------------- BENCHMARKING ENGINE ---------------------------- */
function buildBenchmark(result, school) {
  const seed = hashSeed(`${school.name}|${school.students}|${school.area}|${school.country}|benchmark`);
  const rand = seededRand(seed);
  const sizeCategory = getSizeCategory(school.students);
  const climateZone = getClimateZone(school.country);

  const categories = [
    { key: "overall", label: "Sustainability Score", value: result.overallScore },
    { key: "energy", label: "Energy Footprint", value: result.componentScores.energy },
    { key: "water", label: "Water Footprint", value: result.componentScores.water },
    { key: "carbon", label: "Carbon Footprint", value: Math.round(100 - result.raw.transportation * 0.6 - result.raw.energy * 0.4) },
    { key: "waste", label: "Waste Footprint", value: result.componentScores.waste },
    { key: "heat", label: "Heat Vulnerability", value: Math.round(100 - result.raw.heating) },
  ];

  return categories.map((c) => {
    const peerAvg = clamp(Math.round(58 + (rand() - 0.5) * 14), 35, 75);
    const topDecile = clamp(peerAvg + 22 + Math.round(rand() * 6), peerAvg + 15, 96);
    
    let percentile = clamp(Math.round(50 + (c.value - peerAvg) * 1.5), 5, 98);
    let category = "Average";
    if (c.value >= topDecile) { category = "Excellent"; percentile = clamp(90 + Math.round(rand() * 9), 90, 99); }
    else if (c.value >= peerAvg + 5) category = "Good";
    else if (c.value < peerAvg - 12) category = "Needs Improvement";

    return {
      ...c, peerAvg, topDecile, percentile, category, sizeCategory, climateZone
    };
  });
}

/* ---------------------------- CLIMATE RISK INTELLIGENCE ---------------------------- */
const CLIMATE_RISK_RULES = {
  hot: [
    { id: "cooling-demand", title: "Excess Cooling Demand", level: "High", impact: "Sustained temperature baselines push environmental system operational hours up, increasing total carbon equivalents.", mitigation: "Enforce scheduled automated cooling parameters and scale shade tree networks." },
    { id: "heat-island", title: "Heat Island Accumulation", level: "High", icon: Flame, impact: "Large dark asphalt parking layouts gather and retain thermal inputs, elevating local surface profiles.", mitigation: "Incorporate high-reflectivity roof coatings or vegetated infrastructure elements." },
    { id: "water-stress", title: "Water Source Scarcity", level: "Medium", impact: "High evapotranspiration loads accelerate outdoor irrigation requirements from baseline reservoirs.", mitigation: "Convert legacy overhead sprinkler hardware to low-flow localized sub-surface drip devices." }
  ],
  humid: [
    { id: "mold-risk", title: "Microbial Mold Risk", level: "High", impact: "Elevated internal moisture values trigger envelope degradation factors inside structural ducts.", mitigation: "Install dynamic multi-stage dehumidification loops coupled with automated fresh air control metrics." },
    { id: "ventilation", title: "Ventilation Thermal Loss", level: "Medium", impact: "Unregulated air exchange systems pull warm damp masses inside, triggering air handler surge states.", mitigation: "Seal structural interface leaks and run dynamic energy recovery ventilators." }
  ],
  dry: [
    { id: "irrigation-loss", title: "Irrigation Vaporization", level: "High", impact: "Open mist irrigation configurations evaporate immediately before reinforcing root architecture.", mitigation: "Automate delivery strictly between midnight and sunrise via localized low-line drip feeds." },
    { id: "dust-accumulation", title: "Solar Array Dust Soiling", level: "Medium", impact: "Particulate deposits on glass faces severely degrade clean energy generation parameters over short windows.", mitigation: "Deploy dry-sweeping maintenance patterns timed with clear local forecast modules." }
  ],
  rainy: [
    { id: "drainage", title: "Drainage Saturation", level: "High", impact: "Abrupt peak storm occurrences overwhelm standard collection lines, causing foundation moisture issues.", mitigation: "Create bioswale retention fields and replace solid surfaces with porous concrete lines." },
    { id: "flood", title: "Low-Zone Vulnerability", level: "Medium", impact: "Surface pooling near mechanical installations introduces operational safety interruption vectors.", mitigation: "Elevate critical power components and maintain automated sump pumps." }
  ],
  temperate: [
    { id: "variable-load", title: "Variable System Shifting", level: "Low", impact: "Fluctuating seasonal variables provoke rapid alternating cycle demands across heating and cooling lines.", mitigation: "Deploy centralized thermostat logic blocks to establish clear operational deadbands." }
  ]
};

function generateClimateRisks(country) {
  const zone = getClimateZone(country);
  return CLIMATE_RISK_RULES[zone] || CLIMATE_RISK_RULES.temperate;
}

/* ============================== ATOMS & GLASS COMPONENT CARDS ============================== */
function GlassCard({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(242,239,230,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${T.line}`,
        borderRadius: 16,
        padding: 24,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, color = T.teal }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 99,
        background: `${color}14`,
        border: `1px solid ${color}33`,
        color: color === T.cream ? T.cream : color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11.5,
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, style, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: T.teal,
        color: T.bg,
        border: "none",
        borderRadius: 9,
        padding: "11px 20px",
        fontFamily: "'Space Grotesk',sans-serif",
        fontWeight: 600,
        fontSize: 14.5,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.15s ease",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = T.tealLight; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = T.teal; }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: T.cream,
        border: `1px solid ${T.line}`,
        borderRadius: 9,
        padding: "11px 20px",
        fontFamily: "'Space Grotesk',sans-serif",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,239,230,0.08)"; e.currentTarget.style.borderColor = "rgba(242,239,230,0.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.line; }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: T.tealLight,
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ width: 18, height: 1, background: T.tealLight, display: "inline-block" }} />
      {children}
    </div>
  );
}

/* ============================== NAVBAR ============================== */
function Navbar({ view, setView }) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "home", label: "Home" },
    { id: "dashboard", label: "Intelligence Dashboard" },
    { id: "responsible-ai", label: "Responsible AI Framework" },
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,22,18,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("home")}>
          <div style={{ background: T.teal, p: 2, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color={T.bg} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700, color: T.cream, letterSpacing: -0.5 }}>
            EcoLens <span style={{ color: T.tealLight, fontWeight: 400 }}>AI</span>
          </span>
        </div>
        <div className="ecolens-desktop-nav" style={{ display: "flex", gap: 24 }}>
          {items.map((it) => (
            <span
              key={it.id}
              onClick={() => setView(it.id)}
              style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, fontWeight: view === it.id ? 600 : 400, color: view === it.id ? T.tealLight : T.mist, cursor: "pointer", transition: "color 0.15s ease" }}
            >
              {it.label}
            </span>
          ))}
        </div>
        <button className="ecolens-mobile-nav-btn" onClick={() => setOpen(!open)} style={{ display: "none", background: "transparent", border: "none", color: T.cream, cursor: "pointer" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="ecolens-mobile-nav" style={{ background: T.bgAlt, borderBottom: `1px solid ${T.line}`, display: "flex", flexDirection: "column", padding: "12px 24px gap 8" }}>
          {items.map((it) => (
            <button key={it.id} onClick={() => { setView(it.id); setOpen(false); }} style={{ padding: "12px 14px", borderRadius: 9, border: "none", textAlign: "left", background: view === it.id ? "rgba(242,239,230,0.1)" : "transparent", color: T.cream, fontFamily: "'Inter',sans-serif", fontSize: 15, cursor: "pointer" }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== HOMEPAGE ============================== */
function ScanlineHero({ setView }) {
  const [sweep, setSweep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSweep(1), 300);
    const t2 = setTimeout(() => setRevealed(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const categories = ["transportation", "energy", "waste", "water", "heating"];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 24px 60px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }} className="ecolens-hero-grid">
      <div>
        <Pill color={T.amber}><Sparkles size={12} /> Hackathon Edition — Updated Intelligence Framework</Pill>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(36px, 5vw, 56px)", color: T.cream, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 18, marginBottom: 22 }}>
          School Sustainability <span style={{ color: T.tealLight }}>Intelligence</span> Platform.
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(15px, 1.8vw, 17.5px)", color: T.mist, lineHeight: 1.6, marginBottom: 36, maxWidth: 620 }}>
          See your school's environmental impact clearly. Enter campus data to get actionable insights for a greener future.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => setView("dashboard")} icon={ArrowRight}>Launch Intelligence Center</PrimaryButton>
          <GhostButton onClick={() => { const el = document.getElementById("how-it-works"); if(el) el.scrollIntoView({ behavior: "smooth" }); }}>Explore Core Engine</GhostButton>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <GlassCard style={{ padding: 24, background: "rgba(15,36,25,0.4)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: T.mistDim, textTransform: "uppercase" }}>Footprint Scanner — Pattern Analysis</span>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: T.tealLight, boxShadow: `0 0 0 4px ${T.teal}33` }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categories.map((c, i) => {
              const meta = CATEGORY_META[c];
              const Icon = meta.icon;
              const isHidden = revealed && c === "transportation";
              const width = revealed ? (c === "transportation" ? 91 : [54, 47, 41, 36][categories.indexOf(c) - 1] || 40) : 10;
              return (
                <div key={c} style={{ background: isHidden ? "rgba(226,101,79,0.12)" : "rgba(242,239,230,0.04)", border: isHidden ? `1px solid ${T.coral}66` : `1px solid ${T.line}`, borderRadius: 12, padding: "11px 14px", transition: "all 0.5s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={14} color={isHidden ? T.coral : T.mist} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: isHidden ? T.cream : T.mist }}>{meta.label}</span>
                    </div>
                    {isHidden && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.coral, fontWeight: 600 }}>[HIDDEN PROFILE SURFACED]</span>}
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "rgba(242,239,230,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${width}%`, background: isHidden ? T.coral : T.sage, borderRadius: 99, transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", pointerEvents: "none", background: "linear-gradient(to bottom, transparent, rgba(27,153,139,0.03) 50%, transparent)", transform: `translateY(${-100 + sweep * 200}%)`, transition: sweep ? "transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none" }} />
        </GlassCard>
      </div>
    </div>
  );
}

function ProblemSection() {
  const stats = [
    { icon: AlertTriangle, stat: "84%", label: "of educational leaders cite lack of granular visibility as their top operational hurdle" },
    { icon: Layers, stat: "2 in 3", label: "school resource parameters are mapped on outdated, static regional sheets" },
    { icon: Target, stat: "0", label: "campus decision frameworks integrate predictive local weather loops out of the box" },
  ];
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px 80px" }}>
      <SectionLabel>The Problem Space</SectionLabel>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.4vw, 38px)", color: T.cream, maxWidth: 720, lineHeight: 1.15, marginBottom: 44 }}>
        Schools require deterministic decision metrics. Not basic calculators.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="ecolens-grid-3">
        {stats.map((s, i) => (
          <GlassCard key={i} style={{ padding: 28 }}>
            <s.icon size={22} color={T.tealLight} style={{ marginBottom: 16 }} />
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: T.cream, marginBottom: 8 }}>{s.stat}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: T.mist, lineHeight: 1.5 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Activity, title: "Quantified Hidden Analysis", desc: "Maps fractional environmental footprints based on campus volume configurations." },
    { icon: Target, title: "School Benchmarking Engine", desc: "Compares current progress scores with similar localized student cohorts and climates." },
    { icon: CalendarClock, title: "Sustainability Roadmaps", desc: "Builds actionable, phased project strategies mapped step-by-step against SDG targets." },
    { icon: ShieldCheck, title: "Climate Risk Intelligence", desc: "Tracks local geographical factors to preempt structural heating and insulation failures." },
  ];
  return (
    <div style={{ background: "rgba(15,24,20,0.4)", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 24px" }}>
        <SectionLabel>Intelligence Suite</SectionLabel>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.4vw, 38px)", color: T.cream, marginBottom: 48 }}>Engineered for decision makers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="ecolens-grid-4">
          {features.map((f, i) => (
            <GlassCard key={i} style={{ padding: 24 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(63,193,172,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={20} color={T.tealLight} />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 600, color: T.cream, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: T.mist, lineHeight: 1.55 }}>{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { label: "Input Config", desc: "Enter campus specs — enrollment tiers, mode shares, and cooling parameters.", icon: GraduationCap },
    { label: "AI Translation", desc: "The platform calculates deterministically against local environmental coefficients.", icon: Activity },
    { icon: Target, label: "Deterministic Forecasts", desc: "Simulate interventions to unlock performance rewards before deployment." }
  ];
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 24px" }} id="how-it-works">
      <SectionLabel>Process Architecture</SectionLabel>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.4vw, 38px)", color: T.cream, marginBottom: 48 }}>From self-reporting to intelligence mapping</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }} className="ecolens-grid-3">
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: T.tealLight, fontWeight: 700 }}>0{i+1}</div>
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 600, color: T.cream, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                {s.label}
              </h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: T.mist, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactPreview() {
  const data = [
    { name: "Transportation", before: 45, after: 78 },
    { name: "Energy Grid", before: 41, after: 84 },
    { name: "Water Systems", before: 50, after: 76 },
    { name: "Campus Canopy", before: 33, after: 68 },
  ];
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px 80px" }}>
      <SectionLabel>Sustainability Framework Outcomes</SectionLabel>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.4vw, 38px)", color: T.cream, maxWidth: 600, marginBottom: 36 }}>Modeled performance transitions</h2>
      <GlassCard style={{ padding: "28px 20px 12px" }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
            <XAxis dataKey="name" stroke={T.mistDim} tick={{ fontFamily: "Inter", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke={T.mistDim} tick={{ fontFamily: "Inter", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: T.bgAlt, border: `1px solid ${T.line}`, borderRadius: 10, fontFamily: "Inter" }} labelStyle={{ color: T.cream }} />
            <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12.5 }} />
            <Bar dataKey="before" name="Baseline Score Metric" fill="rgba(242,239,230,0.25)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="after" name="Optimized Level" fill={T.teal} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function Homepage({ setView }) {
  return (
    <div>
      <ScanlineHero setView={setView} />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImpactPreview />
    </div>
  );
}

/* ============================== FORMS AND RANGE SLIDERS ============================== */
const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${T.line}`,
  background: "rgba(10,22,18,0.4)", color: T.cream, fontFamily: "'Inter',sans-serif",
  fontSize: 14, outline: "none", boxSizing: "border-box"
};

function SegmentedControl({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: value === o.value ? `1px solid ${T.teal}` : `1px solid ${T.line}`, background: value === o.value ? "rgba(27,153,139,0.18)" : "rgba(10,22,18,0.4)", color: value === o.value ? T.tealLight : T.mist, fontFamily: "'Inter',sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CircularSlider({ label, value, onChange, min = 0, max = 100, color = T.teal, icon: Icon, suffix = "%", hint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Inter',sans-serif", fontSize: 13, color: T.cream, fontWeight: 500 }}>
          {Icon && <Icon size={14} color={color} />} {label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color, fontWeight: 700, background: `${color}1c`, border: `1px solid ${color}44`, borderRadius: 7, padding: "2px 9px", minWidth: 44, textAlign: "center" }}>
          {value}{suffix}
        </span>
      </div>
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 99, background: "rgba(242,239,230,0.1)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
        </div>
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ position: "relative", zIndex: 1, width: "100%", accentColor: color, cursor: "pointer", opacity: 0.8 }} />
      </div>
      {hint && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11.5, color: T.mistDim, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function IconSelect({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = value === o.value;
        const OIcon = o.icon;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ flex: "1 1 auto", display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 8, border: active ? `1px solid ${T.teal}` : `1px solid ${T.line}`, background: active ? "rgba(27,153,139,0.18)" : "rgba(10,22,18,0.4)", color: active ? T.tealLight : T.mist, fontFamily: "'Inter',sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            <OIcon size={14} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SchoolForm({ school, setSchool, onSubmit }) {
  const set = (k) => (e) => setSchool((s) => ({ ...s, [k]: e.target.value }));
  const fillSample = () => setSchool(SAMPLE_SCHOOL);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const cityDebounceRef = useRef(null);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const countryDebounceRef = useRef(null);

  const fetchCitySuggestions = async (query, countryFilter = null) => {
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    setCityLoading(true);
    try {
      let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&limit=10&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`;
      // Add country filter if provided
      if (countryFilter) {
        url += `&filter=countrycode:${countryFilter.toLowerCase()}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setCitySuggestions(data.features?.map(f => ({
        city: f.properties.city,
        country: f.properties.country,
        // Store full properties if needed for more detail
      })) ?? []);
    } catch (err) {
      console.error('Geoapify city error:', err);
      setCitySuggestions([]);
    } finally {
      setCityLoading(false);
    }
  };

  const fetchCountrySuggestions = async (query) => {
    if (!query || query.length < 2) {
      setCountrySuggestions([]);
      return;
    }
    setCountryLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=country&limit=5&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      setCountrySuggestions(data.features?.map(f => f.properties.country) ?? []);
    } catch (err) {
      console.error('Geoapify country error:', err);
      setCountrySuggestions([]);
    } finally {
      setCountryLoading(false);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    set("city")(e);
    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current);
    }
    cityDebounceRef.current = setTimeout(() => {
      // Pass current country as filter if it exists
      const countryFilter = school.country || null;
      fetchCitySuggestions(value, countryFilter);
    }, 300);
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    set("country")(e);
    if (countryDebounceRef.current) {
      clearTimeout(countryDebounceRef.current);
    }
    countryDebounceRef.current = setTimeout(() => {
      fetchCountrySuggestions(value);
      // Refresh city suggestions with new country filter if there's a city value
      if (school.city && school.city.length >= 2) {
        fetchCitySuggestions(school.city, value);
      }
    }, 300);
  };

  return (
    <GlassCard style={{ padding: 24, background: "rgba(15,36,25,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 600, color: T.cream, margin: 0 }}>Campus Inventory Profile</h3>
        <span onClick={fillSample} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: T.amber, cursor: "pointer", textDecoration: "underline" }}>Load Baseline Mock</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>School Name</label>
          <input style={inputStyle} type="text" value={school.name} onChange={set("name")} placeholder="e.g. Oakridge Academy" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>City</label>
            <div style={{ position: "relative" }}>
              <input
                style={inputStyle}
                type="text"
                value={school.city}
                onChange={handleCityChange}
                placeholder="e.g. Doha"
              />
              {cityLoading && (
                <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: T.tealLight, fontSize: 12 }}>
                  <span>⟳</span>
                </div>
              )}
              {citySuggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  zIndex: 10,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxSizing: "border-box"
                }}>
                  {citySuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: idx === citySuggestions.length - 1 ? "none" : `1px solid ${T.line}`,
                        background: T.surface,
                        color: T.ink,
                        fontSize: 13
                      }}
                      onClick={() => {
                        setSchool(s => ({ ...s, city: suggestion.city, country: suggestion.country }));
                        setCitySuggestions([]);
                        if (cityDebounceRef.current) {
                          clearTimeout(cityDebounceRef.current);
                        }
                      }}
                    >
                      {suggestion.city}, {suggestion.country}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Country</label>
            <div style={{ position: "relative" }}>
              <input
                style={inputStyle}
                type="text"
                value={school.country}
                onChange={handleCountryChange}
                placeholder="Select country"
              />
              {countryLoading && (
                <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: T.tealLight, fontSize: 12 }}>
                  <span>⟳</span>
                </div>
              )}
              {countrySuggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  zIndex: 10,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxSizing: "border-box"
                }}>
                  {countrySuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: idx === countrySuggestions.length - 1 ? "none" : `1px solid ${T.line}`,
                        background: T.surface,
                        color: T.ink,
                        fontSize: 13
                      }}
                      onClick={() => {
                        setSchool(s => ({ ...s, country: suggestion }));
                        setCountrySuggestions([]);
                        if (countryDebounceRef.current) {
                          clearTimeout(countryDebounceRef.current);
                        }
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Student Headcount</label>
            <input style={inputStyle} type="number" value={school.students} onChange={set("students")} placeholder="500" />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Campus Area (m²)</label>
            <input style={inputStyle} type="number" value={school.area} onChange={set("area")} placeholder="15000" />
          </div>
        </div>

        <CircularSlider label="Green Canopy Cover" value={Number(school.greenCover) || 0} onChange={(v) => setSchool(s => ({ ...s, greenCover: String(v) }))} icon={TreePine} hint="Percentage of estate shaded by foliage" />

        <div>
          <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Total Physical Blocks</label>
          <input style={inputStyle} type="number" value={school.buildings} onChange={set("buildings")} placeholder="3" />
        </div>

        <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: T.tealLight, marginBottom: 12 }}>How Students & Staff Get to School</div>
          <CircularSlider label="% by Car" value={Number(school.carPct) || 0} onChange={(v) => setSchool(s => ({ ...s, carPct: String(v) }))} color={T.coral} />
          <CircularSlider label="% by Bus" value={Number(school.busPct) || 0} onChange={(v) => setSchool(s => ({ ...s, busPct: String(v) }))} color={T.amber} />
          <CircularSlider label="% by Train/Subway" value={Number(school.metroPct) || 0} onChange={(v) => setSchool(s => ({ ...s, metroPct: String(v) }))} color={T.teal} />
          <CircularSlider label="% by Walk/Bike" value={Number(school.walkCyclePct) || 0} onChange={(v) => setSchool(s => ({ ...s, walkCyclePct: String(v) }))} color={T.sageLight} />
        </div>

        <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
          <CircularSlider label="Heating & Cooling Hours/Day" min={0} max={24} suffix=" hrs/day" value={Number(school.acHours) || 0} onChange={(v) => setSchool(s => ({ ...s, acHours: String(v) }))} icon={Thermometer} />
        </div>

        <div>
          <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Trash & Recycling</label>
          <SegmentedControl value={school.waste} onChange={(v) => setSchool(s => ({ ...s, waste: v }))} options={[{ value: "low", label: "Low Amount" }, { value: "medium", label: "Medium Amount" }, { value: "high", label: "High Amount" }]} />
        </div>

        <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: T.tealLight, marginBottom: 12 }}>Water System Architecture</div>
          <CircularSlider label="Reported Daily Flow Volume" min={10} max={150} suffix=" L/capita" value={Number(school.waterLitersPerStudent) || 40} onChange={(v) => setSchool(s => ({ ...s, waterLitersPerStudent: String(v) }))} icon={Droplets} />

          <div style={{ marginBottom: 10, marginTop: 10 }}>
            <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Campus Grounds Irrigation</label>
            <SegmentedControl value={school.irrigation} onChange={(v) => setSchool(s => ({ ...s, irrigation: v }))} options={[{ value: "yes", label: "Active Array" }, { value: "no", label: "None / Rainfed" }]} />
          </div>

          {school.irrigation === "yes" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Irrigation Layout Standard</div>
              <IconSelect value={school.irrigationType} onChange={(v) => setSchool(s => ({ ...s, irrigationType: v }))} options={[
                { value: "manual", label: "Manual Line", icon: Droplets },
                { value: "sprinkler", label: "Broadcast Sprinkler", icon: CloudRain },
                { value: "drip", label: "Subsurface Drip", icon: Activity }
              ]} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Primary Supply Source</label>
              <select style={inputStyle} value={school.waterSource} onChange={set("waterSource")}>
                <option value="municipal">Municipal Main</option>
                <option value="borewell">Deep Aquifer</option>
                <option value="recycled">Recycled Graywater</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, color: T.mist, marginBottom: 6 }}>Submetering & Triggers</label>
              <SegmentedControl value={school.waterMetering} onChange={(v) => setSchool(s => ({ ...s, waterMetering: v }))} options={[{ value: "yes", label: "Active Feed" }, { value: "no", label: "Absent" }]} />
            </div>
          </div>
        </div>

        <PrimaryButton onClick={onSubmit} icon={Activity} style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
          Analyze Environment Grid
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

/* ============================== CONTEXT WEATHER INTEGRATION ============================== */
function ContextCards({ school }) {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  useEffect(() => {
    // Fetch weather when city changes
    if (school.city && school.city.trim() !== '') {
      fetchWeatherData();
    } else {
      // Clear weather data if no city
      setWeatherData(null);
      setWeatherError(null);
    }
  }, [school.city, school.country]);

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      // Get OpenWeather API key from environment variable
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      // If API key is not set or empty, show error
      if (!apiKey || apiKey.trim() === '') {
        setWeatherError('OpenWeather API key not configured. Please set VITE_OPENWEATHER_API_KEY in .env file');
        setWeatherLoading(false);
        return;
      }

      // Log for debugging (remove in production)
      console.log('Fetching weather for:', { city: school.city, country: school.country });

      const query = school.country ? `${school.city},${school.country}` : school.city;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = `${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorDetails += `: ${errorData.message}`;
          }
        } catch (e) {
          // Ignore if response body is not JSON
        }
        throw new Error(`Weather API error: ${errorDetails}`);
      }

      const data = await response.json();
      setWeatherData({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        icon: data.weather[0].icon
      });
    } catch (err) {
      console.error('Weather API error:', err);
      let errorMessage = 'Failed to load weather data';
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setWeatherError(errorMessage);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fallback to simulated data if weather not available
  const climate = getClimate(school.country);
  const zone = getClimateZone(school.country);
  const zMeta = CLIMATE_ZONE_META[zone];
  const WeatherIcon = climate.icon;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }} className="ecolens-grid-2">
      <GlassCard style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(232,163,61,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {weatherData && weatherData.icon ? (
            <>
              {/* Weather icon from OpenWeather */}
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                alt={weatherData.description}
                style={{ width: 20, height: 20 }}
              />
            </>
          ) : (
            <WeatherIcon size={20} color={T.amber} />
          )}
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mistDim, textTransform: "uppercase" }}>
            {weatherLoading ? "Loading weather..." : weatherError ? `Error: ${weatherError}` : "Climate Data"}
          </div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: T.cream, marginTop: 2 }}>
            {school.city || "Local Environment"}
            {weatherData ? `${weatherData.temp}°C` : `${climate.temp}°C`}
          </div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12.5, color: T.mist }}>
            {weatherData ? `${weatherData.description} · RH ${weatherData.humidity}%` : `${climate.condition} · RH ${climate.humidity}%`}
          </div>
        </div>
      </GlassCard>

      {/* Second card remains unchanged - benchmark cohort zone */}
      <GlassCard style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${zMeta.color}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MapIcon size={20} color={zMeta.color} />
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mistDim, textTransform: "uppercase" }}>Benchmark Cohort Zone</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: T.cream, marginTop: 2 }}>{zMeta.label}</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12.5, color: T.mist }}>Size Category: {getSizeCategory(school.students)} Tier</div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ============================== EXECUTIVE SUMMARY (NEW SECTION) ============================== */
function ExecutiveSummary({ result, school, recommendations }) {
  const topAction = recommendations[0];
  const maxRisk = generateClimateRisks(school.country)[0];
  const potentialYield = recommendations.slice(0, 3).reduce((acc, curr) => acc + (curr.forecast?.score || 3), 0);
  
  let statusStr = "Needs Optimization Strategy";
  let statusColor = T.coral;
  if (result.overallScore >= 75) { statusStr = "Outstanding Model Campus"; statusColor = T.sageLight; }
  else if (result.overallScore >= 55) { statusStr = "Satisfactory Core Alignment"; statusColor = T.amber; }

  return (
    <GlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 22, border: `1px solid ${T.teal}33` }}>
      <div style={{ padding: "14px 20px", background: `linear-gradient(135deg, rgba(27,153,139,0.12), rgba(90,143,105,0.06))`, borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10 }}>
        <ClipboardList size={16} color={T.tealLight} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: T.tealLight, textTransform: "uppercase", fontWeight: 600 }}>Executive Sustainability Intelligence Brief</span>
      </div>
      <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }} className="ecolens-grid-2">
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: T.cream, lineHeight: 1.6, margin: 0 }}>
            <strong>{school.name || "Target Facility"}</strong> features a deterministic index configuration of <strong style={{ color: statusColor }}>{result.overallScore}/100 ({statusStr})</strong>. Structural pattern analysis isolates <strong>{CATEGORY_META[result.hiddenKey]?.label}</strong> as the principal hidden footprint coefficient, accounting for <strong>{result.contribution[result.hiddenKey]}%</strong> of relative impact dynamics.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ padding: "6px 12px", background: "rgba(242,239,230,0.03)", borderRadius: 6, border: `1px solid ${T.line}` }}>
              <span style={{ display: "block", fontSize: 10, color: T.mistDim, fontFamily: "'JetBrains Mono'" }}>PRIMARY IMPACT RISK</span>
              <span style={{ fontSize: 12.5, color: T.coral, fontWeight: 600 }}>{maxRisk?.title} ({maxRisk?.level})</span>
            </div>
            <div style={{ padding: "6px 12px", background: "rgba(242,239,230,0.03)", borderRadius: 6, border: `1px solid ${T.line}` }}>
              <span style={{ display: "block", fontSize: 10, color: T.mistDim, fontFamily: "'JetBrains Mono'" }}>MAX LEVERAGE ACTION</span>
              <span style={{ fontSize: 12.5, color: T.tealLight, fontWeight: 600 }}>{topAction?.name}</span>
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(242,239,230,0.02)", borderRadius: 10, padding: 16, borderLeft: `3px solid ${T.teal}`, display: "flex", flexDirection: "column", justify: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: T.tealLight }}>+{potentialYield} Points</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: T.mist, marginTop: 4 }}>Simulated Roadmap Target Performance Vector</div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================== QUANTIFIED HIDDEN FOOTPRINT MODULE ============================== */
function HiddenFootprintModule({ result }) {
  const meta = CATEGORY_META[result.hiddenKey];
  const Icon = meta?.icon || Activity;

  const chartData = useMemo(() => {
    return Object.entries(result.contribution).map(([key, value]) => ({
      name: CATEGORY_META[key]?.label || key,
      value: value,
      fill: CATEGORY_META[key]?.color || T.teal,
      tons: result.annualImpactTons[key] || 0,
      severity: result.severity[key] || 1
    }));
  }, [result]);

  return (
    <GlassCard style={{ marginBottom: 22, border: `1px solid ${T.coral}22` }}>
      <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={17} color={T.coral} />
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Quantified Hidden Footprint Analysis</h3>
        </div>
        <Pill color={T.coral}>Flagship Core Resolution</Pill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }} className="ecolens-hero-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${meta?.color}1a`, display: "flex", alignItems: "center", justify: "center", justifyContent: "center" }}>
              <Icon size={16} color={meta?.color} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: T.mistDim, display: "block", fontFamily: "'JetBrains Mono'" }}>DOMINANT IMPACT TRACKER</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: T.cream }}>{meta?.label} Contributes {result.contribution[result.hiddenKey]}%</span>
            </div>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: T.mist, lineHeight: 1.6, marginBottom: 16 }}>
            {result.explanation} This variance creates <strong>{result.annualImpactTons[result.hiddenKey]} Tons CO₂e/yr</strong> in structural offset liability, matching a Severity Level of <strong>{result.severity[result.hiddenKey]}/5</strong>.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {chartData.map((row) => (
              <div key={row.name} style={{ background: "rgba(242,239,230,0.02)", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: T.cream, fontWeight: 500 }}>{row.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", color: row.fill }}>{row.value}% · {row.tons} t/yr (Sev {row.severity})</span>
                </div>
                <div style={{ height: 4, background: "rgba(242,239,230,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${row.value}%`, background: row.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justify: "center", justifyContent: "center", minHeight: 200 }}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Contribution Share"]} contentStyle={{ background: T.bgAlt, border: `1px solid ${T.line}`, borderRadius: 8 }} labelStyle={{ color: T.cream }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================== SCHOOL BENCHMARKING MODULE (NEW SECTION) ============================== */
function BenchmarkingModule({ result, school }) {
  const benchmarks = useMemo(() => buildBenchmark(result, school), [result, school]);

  return (
    <GlassCard style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justify: "space-between", justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={17} color={T.tealLight} />
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>School Benchmarking & Decile Standings</h3>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: T.mistDim }}>Cohort Group: {getSizeCategory(school.students)} Enrollment / {CLIMATE_ZONE_META[getClimateZone(school.country)]?.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 24 }} className="ecolens-hero-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {benchmarks.map((b) => {
            let catColor = T.coral;
            if (b.category === "Excellent") catColor = T.tealLight;
            else if (b.category === "Good") catColor = T.sageLight;
            else if (b.category === "Average") catColor = T.amber;

            return (
              <div key={b.key} style={{ background: "rgba(242,239,230,0.02)", padding: 14, borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 500, color: T.cream }}>{b.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: catColor, background: `${catColor}14`, padding: "2px 6px", borderRadius: 4 }}>{b.category} ({b.percentile}th Pct)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ flex: 1 }}><span style={{ color: T.mistDim }}>School:</span> <strong style={{ color: T.cream }}>{b.value}</strong></div>
                  <div style={{ flex: 1 }}><span style={{ color: T.mistDim }}>Peer Avg:</span> <strong style={{ color: T.mist }}>{b.peerAvg}</strong></div>
                  <div style={{ flex: 1 }}><span style={{ color: T.mistDim }}>Top 10%:</span> <strong style={{ color: T.tealLight }}>{b.topDecile}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={benchmarks.slice(0, 4)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="label" stroke={T.mistDim} tick={{ fontSize: 11, fontFamily: "Inter" }} />
              <YAxis domain={[0, 100]} stroke={T.mistDim} tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: T.bgAlt, border: `1px solid ${T.line}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" name="Your School" fill={T.teal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="peerAvg" name="Peer Average" fill="rgba(242,239,230,0.2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="topDecile" name="Top Sustainable" fill={T.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================== SUSTAINABILITY ROADMAP GENERATOR (NEW SECTION) ============================== */
function RoadmapModule({ recommendations }) {
  const roadmapPhases = useMemo(() => buildRoadmap(recommendations), [recommendations]);

  return (
    <GlassCard style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justify: "space-between", justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarClock size={17} color={T.tealLight} />
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Strategic Phased Sustainability Roadmap</h3>
        </div>
        <Pill color={T.teal}>Dynamic Project Matrix</Pill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        {roadmapPhases.map((phase) => {
          const targetedActions = phase.actions.slice(0, 2);
          if (targetedActions.length === 0) return null;

          return (
            <div key={phase.key} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, background: "rgba(242,239,230,0.01)", padding: 16, borderRadius: 12, borderLeft: `4px solid ${phase.color}` }} className="ecolens-hero-grid">
              <div>
                <span style={{ display: "block", fontFamily: "'Space Grotesk'", fontWeight: 600, color: T.cream, fontSize: 15 }}>{phase.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: phase.color, fontWeight: 700 }}>{phase.window}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {targetedActions.map((act) => (
                  <div key={act.id} style={{ background: "rgba(10,22,18,0.3)", borderRadius: 8, padding: 12, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: T.cream }}>{act.name}</span>
                      <div style={{ display: "flex", gap: 6, fontSize: 10, fontFamily: "'JetBrains Mono'" }}>
                        <span style={{ color: T.amber }}>Cost: {act.cost}</span>
                        <span style={{ color: T.tealLight }}>Diff: {act.difficulty}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: T.mist, margin: "0 0 8px 0", lineHeight: 1.4 }}>{act.desc}</p>
                    <div style={{ fontSize: 11, color: T.sageLight, display: "flex", justify: "space-between", justifyContent: "space-between" }}>
                      <span><strong>Yield:</strong> {act.benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ============================== CLIMATE RISK INTELLIGENCE MODULE (NEW SECTION) ============================== */
function ClimateRiskIntelligence({ school }) {
  const risks = useMemo(() => generateClimateRisks(school.country), [school.country]);

  return (
    <GlassCard style={{ marginBottom: 22, border: `1px solid ${T.amber}22` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 16 }}>
        <ShieldCheck size={17} color={T.amber} />
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Geographical Climate Risk Intelligence</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {risks.map((risk) => (
          <div key={risk.id} style={{ background: "rgba(242,239,230,0.02)", border: `1px solid ${T.line}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, color: T.cream, fontSize: 14 }}>{risk.title}</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: risk.level === "High" ? T.coral : T.amber, background: risk.level === "High" ? `${T.coral}14` : `${T.amber}14`, padding: "2px 6px", borderRadius: 4 }}>{risk.level} Severity</span>
            </div>
            <p style={{ fontSize: 12.5, color: T.mist, lineHeight: 1.45, margin: "0 0 10px 0" }}>{risk.impact}</p>
            <div style={{ background: "rgba(27,153,139,0.05)", padding: 8, borderRadius: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <Target size={12} color={T.tealLight} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: T.tealLight, lineHeight: 1.3 }}><strong>Mitigation Framework:</strong> {risk.mitigation}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ============================== SUSTAINABILITY SCORE SUB-MODULE ============================== */
function ScoreRing({ score, size = 168 }) {
  let ringColor = T.coral;
  if (score >= 72) ringColor = T.sageLight;
  else if (score >= 50) ringColor = T.amber;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ value: score, fill: ringColor }]} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: "rgba(242,239,230,0.06)" }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: size * 0.24, color: T.cream, lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: T.mistDim, marginTop: 4 }}>/ 100</div>
      </div>
    </div>
  );
}

function ScoreModule({ result }) {
  const breakDown = [
    { label: "Transportation Balance", val: result.componentScores.transportation, c: T.coral },
    { label: "Energy Efficiency", val: result.componentScores.energy, c: T.amber },
    { label: "Waste Management Loop", val: result.componentScores.waste, c: "#9B6FE0" },
    { label: "Water Asset Security", val: result.componentScores.water, c: T.teal },
    { label: "Ecological Canopy Index", val: result.componentScores.campus, c: T.sageLight },
  ];

  return (
    <GlassCard style={{ marginBottom: 22, padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 32, alignItems: "center" }} className="ecolens-score-grid">
        <div>
          <ScoreRing score={result.overallScore} size={140} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {breakDown.map((b) => (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                <span style={{ color: T.mist }}>{b.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: b.c, fontWeight: 600 }}>{b.val}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(242,239,230,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.val}%`, background: b.c, borderRadius: 3, transition: "width 0.8s ease-in-out" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================== INTERVENTIONS AND SDG MAPPING ============================== */
function RecommendationsModule({ recommendations, addedIds, onToggle }) {
  return (
    <GlassCard style={{ marginBottom: 22 }}>
      <div style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>UN SDG-Mapped Interventions</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ecolens-grid-2">
        {recommendations.slice(0, 4).map((act) => {
          const added = addedIds.includes(act.id);
          return (
            <div key={act.id} style={{ background: "rgba(242,239,230,0.01)", border: added ? `1px solid ${T.teal}` : `1px solid ${T.line}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justify: "space-between", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, color: T.cream, fontSize: 14.5 }}>{act.name}</span>
                  <button onClick={() => onToggle(act.id)} style={{ background: "transparent", border: "none", color: added ? T.coral : T.tealLight, cursor: "pointer", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>
                    {added ? "Remove [-]" : "Simulate [+]"}
                  </button>
                </div>
                <p style={{ fontSize: 12.5, color: T.mist, lineHeight: 1.4, margin: "0 0 12px 0" }}>{act.desc}</p>
              </div>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10, marginTop: 10 }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: T.mistDim, marginBottom: 6 }}>TARGET SUSTAINABLE DEVELOPMENT GOALS</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {act.sdgs.map(no => {
                    const sdg = SDG_META[no];
                    return (
                      <span key={no} style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: `${sdg.color}18`, color: sdg.color, border: `1px solid ${sdg.color}33`, fontFamily: "'JetBrains Mono'" }} title={sdg.desc}>
                        SDG {no}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ============================== IMPACT FORECAST ENGINE SIMULATOR ============================== */
function SimulatorModule({ result, addedIds, recommendations }) {
  const simulatedImpact = useMemo(() => {
    let delta = 0;
    let energyChange = 0;
    let waterChange = 0;
    let carbonChange = 0;

    addedIds.forEach(id => {
      const match = recommendations.find(r => r.id === id);
      if (match) {
        delta += (match.forecast?.score || 4);
        if (match.category === "energy") energyChange -= 12;
        if (match.category === "water") waterChange -= 15;
        if (match.category === "transportation") carbonChange -= 14;
      }
    });

    return {
      scoreBefore: result.overallScore,
      scoreAfter: clamp(result.overallScore + delta, 0, 100),
      energyBefore: result.componentScores.energy,
      energyAfter: clamp(result.componentScores.energy - Math.abs(energyChange), 5, 100),
      waterBefore: result.componentScores.water,
      waterAfter: clamp(result.componentScores.water - Math.abs(waterChange), 5, 100),
    };
  }, [result, addedIds, recommendations]);

  const comparisonData = [
    { name: "Total Index Score", baseline: simulatedImpact.scoreBefore, simulated: simulatedImpact.scoreAfter },
    { name: "Energy Footprint Index", baseline: simulatedImpact.energyBefore, simulated: simulatedImpact.energyAfter },
    { name: "Water Consumption Index", baseline: simulatedImpact.waterBefore, simulated: simulatedImpact.waterAfter }
  ];

  return (
    <GlassCard style={{ marginBottom: 22, border: `1px solid ${T.teal}34` }}>
      <div style={{ display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.line}`, paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Gauge size={17} color={T.tealLight} />
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Impact Forecast Engine & Simulator</h3>
        </div>
        <Pill color={T.teal}>{addedIds.length} System Elements Configured</Pill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }} className="ecolens-hero-grid">
        <div>
          <p style={{ fontSize: 13, color: T.mist, lineHeight: 1.5, margin: "0 0 16px 0" }}>
            Select or isolate specific recommendations to view modeled project trajectory results prior to making real capital deployments.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "rgba(242,239,230,0.02)", padding: 12, borderRadius: 8, border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 11, color: T.mistDim, fontFamily: "'JetBrains Mono'" }}>INDEX TIMELINE CHANGE</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: T.mist }}>{simulatedImpact.scoreBefore}</span>
                <ArrowRight size={14} color={T.tealLight} />
                <span style={{ fontSize: 24, fontWeight: 700, color: T.tealLight }}>{simulatedImpact.scoreAfter}</span>
                <span style={{ fontSize: 12, color: T.tealLight, marginLeft: "auto", fontFamily: "'JetBrains Mono'" }}>
                  +{Math.round(((simulatedImpact.scoreAfter - simulatedImpact.scoreBefore)/Math.max(1, simulatedImpact.scoreBefore))*100)}% shift
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="name" stroke={T.mistDim} tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <YAxis stroke={T.mistDim} tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: T.bgAlt, border: `1px solid ${T.line}` }} />
              <Bar dataKey="baseline" name="Current Baseline" fill="rgba(242,239,230,0.15)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="simulated" name="Forecast Transition" fill={T.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================== SUSTAINABILITY ACHIEVEMENT SYSTEM ============================== */
function AchievementsModule({ result }) {
  const earnedIds = useMemo(() => {
    const list = [];
    list.push("carbon"); // Scan completed baseline
    if (result.overallScore > 60) list.push("campus");
    if (result.componentScores.water > 50) list.push("water");
    if (result.componentScores.waste > 50) list.push("waste");
    if (result.overallScore >= 72) list.push("champion");
    return list;
  }, [result]);

  return (
    <GlassCard style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Award size={17} color={T.tealLight} />
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Campus Sustainability Achievements</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }} className="ecolens-badges-grid">
        {BADGES.map((badge) => {
          const earned = earnedIds.includes(badge.id);
          const BIcon = badge.icon;
          return (
            <div key={badge.id} style={{ padding: 12, background: earned ? "rgba(27,153,139,0.06)" : "rgba(242,239,230,0.01)", border: earned ? `1px solid ${T.teal}66` : `1px solid ${T.line}`, borderRadius: 10, textAlign: "center", opacity: earned ? 1 : 0.35, transition: "all 0.3s ease" }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: earned ? T.teal : "rgba(242,239,230,0.05)", display: "flex", alignItems: "center", justify: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <BIcon size={14} color={earned ? T.bg : T.mistDim} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.cream, fontFamily: "'Space Grotesk'" }}>{badge.name}</div>
              <div style={{ fontSize: 9, color: T.mistDim, marginTop: 4, lineHeight: 1.2 }}>{badge.desc}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ============================== REPORT GENERATION AND PDF ENHANCEMENT ============================== */
function ReportModule({ school, result, recommendations, addedIds }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1200);
  };

  const exportPDF = () => {
    // Print window action formatted beautifully to adapt container structures for presentation layout exports
    const originalTitle = document.title;
    document.title = `${school.name || "School"}_Sustainability_Intelligence_Report`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <GlassCard style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justify: "space-between", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={17} color={T.tealLight} />
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.cream, margin: 0 }}>Administrative Executive Report Center</h3>
        </div>
        {!generated ? (
          <PrimaryButton onClick={handleGenerate} icon={Sparkles} style={{ padding: "8px 14px", fontSize: 13 }}>
            {generating ? "Compiling Matrix..." : "Compile Briefing"}
          </PrimaryButton>
        ) : (
          <GhostButton onClick={exportPDF} icon={Download} style={{ padding: "8px 14px", fontSize: 13 }}>
            Export Presentation PDF
          </GhostButton>
        )}
      </div>

      {generated && (
        <div id="ecolens-printable-area" style={{ background: T.surface, color: T.ink, borderRadius: 12, padding: 24, marginTop: 14, fontFamily: "'Inter',sans-serif" }}>
          <div style={{ borderBottom: "2px solid #0F2419", paddingBottom: 10, marginBottom: 16, display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Space Grotesk'", fontSize: 20 }}>EcoLens Sustainability Intelligence Report</h2>
              <span style={{ fontSize: 12, color: "rgba(15,36,25,0.7)" }}>Facility Inventory: {school.name || "Default Estate"} ({school.city}, {school.country})</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk'" }}>Score: {result.overallScore}/100</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12, marginBottom: 16 }}>
            <div>
              <strong>Quantified Hidden Footprint Coefficient:</strong>
              <p style={{ margin: "4px 0 0 0" }}>{CATEGORY_META[result.hiddenKey]?.label} accounts for {result.contribution[result.hiddenKey]}% of localized environmental structural offset variance ({result.annualImpactTons[result.hiddenKey]} Tons CO₂e/yr liability).</p>
            </div>
            <div>
              <strong>Simulated Roadmap Projection Matrix:</strong>
              <p style={{ margin: "4px 0 0 0" }}>{addedIds.length > 0 ? `Targeted integration of ${addedIds.length} system nodes yields verified stabilization markers across multiple administrative terms.` : "No simulated alterations applied to current configuration."}</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(15,36,25,0.15)", paddingTop: 10, fontSize: 10, color: "rgba(15,36,25,0.5)" }}>
            Verification standard calculated deterministically via EcoLens local coefficient maps. Validated for school administrators and review panels.
          </div>
        </div>
      )}
    </GlassCard>
  );
}

/* ============================== MAIN DASHBOARD CONTAINER ============================== */
function Dashboard() {
  const [school, setSchool] = useState({
    name: "", city: "", country: "", students: "1240", area: "42000",
    greenCover: "14", buildings: "6", busPct: "15", metroPct: "5",
    walkCyclePct: "10", carPct: "70", acHours: "11", waste: "medium",
    irrigation: "yes", irrigationType: "sprinkler", waterSource: "municipal",
    waterMetering: "no", waterLitersPerStudent: "55"
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [submitted, setSubmitted] = useState(false);
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const result = useMemo(() => {
    return runFootprintEngine(school);
  }, [school]);

  const recommendations = useMemo(() => {
    return buildRecommendations(result);
  }, [result]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const toggleAction = (id) => {
    setAddedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <Pill color={T.teal}>Intelligence Operational Deck</Pill>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: T.cream, marginTop: 12, marginBottom: 8 }}>
          Sustainability Intelligence Center
        </h2>
        <p style={{ fontSize: 14, color: T.mist, margin: 0 }}>
          Configure physical assets and operational modes to map institutional standings.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: submitted ? (windowWidth < 768 ? "1fr" : "380px 1fr") : "minmax(0, 640px)", gap: 28, alignItems: "start", justifyContent: submitted ? "stretch" : "center" }} className="ecolens-dash-grid">
        <div style={submitted && windowWidth >= 768 ? { position: "sticky", top: 80, maxHeight: "calc(100vh - 100px)", overflowY: "auto" } : {}}>
          <SchoolForm school={school} setSchool={setSchool} onSubmit={handleSubmit} />
        </div>
        {submitted && (
          <div>
            <ContextCards school={school} />
            <ExecutiveSummary result={result} school={school} recommendations={recommendations} />
            <HiddenFootprintModule result={result} />
            <ScoreModule result={result} />
            <BenchmarkingModule result={result} school={school} />
            <RoadmapModule recommendations={recommendations} />
            <ClimateRiskIntelligence school={school} />
            <RecommendationsModule recommendations={recommendations} addedIds={addedIds} onToggle={toggleAction} />
            <SimulatorModule result={result} addedIds={addedIds} recommendations={recommendations} />
            <AchievementsModule result={result} />
            <ReportModule school={school} result={result} recommendations={recommendations} addedIds={addedIds} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== RESPONSIBLE AI STANDARDS PAGE ============================== */
function ResponsibleAIPage() {
  const items = [
    { icon: AlertTriangle, title: "Deterministic Framework Boundaries", color: T.coral, body: "Calculations evaluate baseline parameter ratios instead of live tracking data loops. Use summaries strictly for prioritization indices." },
    { icon: ShieldCheck, title: "Data Isolation Protocols", color: T.tealLight, body: "Inventory metrics reside purely inside the active window memory environment and remain local to the device context." }
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
      <SectionLabel>Responsible System Usage</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, color: T.cream, marginBottom: 20 }}>Model Alignment Framework</h1>
      <p style={{ fontSize: 15, color: T.mist, lineHeight: 1.6, marginBottom: 36 }}>
        EcoLens platform summaries provide high-leverage estimates designed to match standardized regional building profiles.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((it, i) => (
          <GlassCard key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${it.color}14`, display: "flex", alignItems: "center", justify: "center", justifyContent: "center", flexShrink: 0 }}>
              <it.icon size={18} color={it.color} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.cream, marginBottom: 4 }}>{it.title}</div>
              <p style={{ fontSize: 13.5, color: T.mist, lineHeight: 1.5, margin: 0 }}>{it.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ============================== SYSTEM FOOTER ============================== */
function Footer({ setView }) {
  return (
    <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 80, background: "rgba(10,22,18,0.5)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px", display: "flex", justify: "space-between", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          {[["Dashboard", "dashboard"], ["Responsible AI Framework", "responsible-ai"]].map(([lbl, val]) => (
            <span key={val} onClick={() => setView(val)} style={{ fontSize: 12.5, color: T.mistDim, cursor: "pointer" }}>{lbl}</span>
          ))}
        </div>
        <span style={{ fontSize: 11.5, color: T.mistDim }}>EcoLens AI Intelligence Deck · Illustrative Reference Metric Engine</span>
      </div>
    </div>
  );
}

/* ============================== APPLICATION COMPILING ROOT ============================== */
export default function EcoLensAI() {
  useFonts();
  const [view, setView] = useState("home");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 1200px 600px at 15% -10%, rgba(27,153,139,0.12), transparent), radial-gradient(ellipse 900px 500px at 100% 10%, rgba(90,143,105,0.1), transparent), ${T.bg}`, color: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <Navbar view={view} setView={setView} />
      {view === "home" && <Homepage setView={setView} />}
      {view === "dashboard" && <Dashboard />}
      {view === "responsible-ai" && <ResponsibleAIPage />}
      <Footer setView={setView} />
    </div>
  );
}