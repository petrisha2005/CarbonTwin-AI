import { Award, BarChart3, Bot, Calculator, CalendarCheck, ChevronRight, Footprints, Leaf, LineChart, Sparkles, Target, TrendingDown, UserRound } from "lucide-react";

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" }
];

export const heroChips = [
  { label: "AI Climate Insights", Icon: Bot },
  { label: "Daily Carbon Tracking", Icon: CalendarCheck },
  { label: "Eco Missions & Rewards", Icon: Award }
];

export const whatItDoes = [
  { title: "Track daily carbon footprint", description: "Log travel, electricity, food, and shopping choices in a guided flow.", Icon: Footprints },
  { title: "Get AI-based recommendations", description: "Receive no-guilt suggestions based on your personal patterns.", Icon: Sparkles },
  { title: "Complete eco missions", description: "Turn small actions into measurable progress and rewards.", Icon: Target },
  { title: "Measure long-term progress", description: "See how your habits change over days, weeks, and months.", Icon: LineChart }
];

export const features = [
  { title: "Baseline Carbon Calculator", description: "Create a personal footprint baseline from travel, electricity, food, and lifestyle inputs.", Icon: Calculator },
  { title: "Daily Eco Quest", description: "Track everyday actions with a quick guided log built for repeat use.", Icon: CalendarCheck },
  { title: "AI Eco Coach", description: "Receive personalized, no-guilt suggestions based on your carbon patterns.", Icon: Bot },
  { title: "Carbon Dashboard", description: "Understand your footprint with clean summaries and practical insights.", Icon: BarChart3 },
  { title: "Eco Missions", description: "Build better habits through focused actions and sustainable challenges.", Icon: Leaf },
  { title: "CarbonTwin Avatar", description: "See your CarbonTwin grow as your climate habits improve.", Icon: UserRound }
];

export const steps = [
  { title: "Calculate your baseline footprint", description: "Start with a simple calculator that maps your current lifestyle impact.", Icon: Calculator },
  { title: "Track daily actions with Eco Quest", description: "Log travel, electricity, food, and shopping choices without complex forms.", Icon: CalendarCheck },
  { title: "Get AI-powered suggestions", description: "Receive focused recommendations that fit your habits and goals.", Icon: Sparkles },
  { title: "Reduce impact and grow your CarbonTwin", description: "Turn small changes into visible progress over time.", Icon: TrendingDown }
];

export const differentiators = [
  { title: "Personalized from your lifestyle", description: "Guidance adapts to the habits and choices each user records.", Icon: Bot },
  { title: "Simple for everyday users", description: "Clear flows make carbon tracking approachable without technical knowledge.", Icon: ChevronRight },
  { title: "No-guilt climate guidance", description: "Suggestions are supportive, practical, and designed for real life.", Icon: Target },
  { title: "Gamified habits and progress", description: "Eco Quest, missions, and the CarbonTwin avatar keep momentum visible.", Icon: Award }
];
