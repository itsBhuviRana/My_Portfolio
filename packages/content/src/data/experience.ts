import type { Experience } from "../types";

/**
 * Only facts supplied by the owner are used. Nothing here states a metric, a team size, a launch date or an
 * outcome, because none was supplied. `impact` stays empty until it can be sourced.
 *
 * The role started on 24 November 2025 and is ongoing, so `period` has no `end`. The model keeps months only.
 * Earlier employers are historical and are not listed until their details are supplied. None of them may ever
 * be presented as the current employer.
 */
export const experience: readonly Experience[] = [
  {
    id: "telus-digital",
    company: "Telus Digital",
    role: "Application Module Development Lead",
    period: { start: "2025-11" },
    summary:
      "Working on Discastra, a mobile agriculture field-management application for iOS and Android, used by agronomists and farmers.",
    impact: [],
    projectIds: ["discastra"],
    responsibilities: [
      {
        title: "Feature development",
        detail: "Primary developer responsible for developing application features.",
      },
      {
        title: "Refactoring and improvements",
        detail:
          "Refactoring existing code, and contributing technical ideas and improvement proposals.",
      },
      {
        title: "Pull-request reviews",
        detail: "Reviewing pull requests for the team and giving technical feedback.",
      },
      {
        title: "Problem solving",
        detail: "Resolving major application problems.",
      },
      {
        title: "Team guidance",
        detail: "Helping and guiding team members when they are blocked.",
      },
      {
        title: "Ticket oversight",
        detail:
          "Reviewing the tickets the team is working on, and giving technical direction where needed.",
      },
    ],
    project: {
      name: "Discastra",
      tagline: "Mobile Agriculture Field Management",
      description:
        "A mobile agriculture field-management application for iOS and Android, used by agronomists and farmers. It is multi-tenant and white-label.",
      context: "Talis Agriculture",
      platform: "React Native + Expo · iOS · Android",
      users: "Agronomists and farmers",
      characteristics: [
        "Offline-first",
        "Local SQLite persistence",
        "Background/online synchronization",
        "Multi-tenant",
        "White-label",
        "Mobile-first",
        "Monorepo",
      ],
      architecture: {
        name: "Atomic Design",
        summary: "The project is built on Atomic Design principles.",
        levels: ["Atoms", "Molecules", "Organisms", "Templates", "Screens"],
      },
      syncFlow: {
        nodes: [
          { label: "Mobile app", detail: "React Native + Expo" },
          { label: "Local database", detail: "Expo SQLite · Drizzle ORM" },
          { label: "Backend", detail: "Synchronized when online" },
        ],
        note: "Data is kept on the device and synchronized with the backend when connectivity is available.",
      },
      technologyGroups: [
        {
          id: "interface",
          layer: "interface",
          label: "Interface",
          technologies: ["React Native", "React", "NativeBase", "Reanimated", "Storybook"],
        },
        {
          id: "components",
          layer: "components",
          label: "Components / Architecture",
          technologies: ["TypeScript", "Atomic Design"],
        },
        {
          id: "state",
          layer: "state",
          label: "State / Data",
          technologies: [
            "Zustand",
            "React Context",
            "urql",
            "GraphQL",
            "ZenStack",
            "Drizzle ORM",
            "Expo SQLite",
          ],
        },
        {
          id: "maps",
          label: "Maps / Field Intelligence",
          technologies: ["React Native Maps", "Turf", "Supercluster", "GeoLib"],
        },
        {
          id: "native",
          layer: "native",
          label: "Native",
          technologies: [
            "Expo Location",
            "Expo Camera",
            "Expo Notifications",
            "Expo Secure Store",
            "MMKV",
          ],
        },
        {
          id: "delivery",
          layer: "delivery",
          label: "Delivery / Quality",
          technologies: ["Jest", "Sentry", "Airbrake", "CodeQL", "GitHub Actions", "CI/CD"],
        },
      ],
      outcome: "Project details coming soon.",
    },
    // Core stack only. These ids match the portfolio skills, so the integrity tests can check them.
    stack: ["react-native", "react", "typescript"],
    status: "published",
  },
];
