import type { Experience } from "../types";

/**
 * The career, newest first, from facts the owner supplied (2026-09-28): company, dates, city and work mode
 * for every role, and what they did in each role, in their own points, written up in technical English.
 * `summary` and `responsibilities` describe the ROLE (what the owner did at the company); project details
 * live in the atlas and the Dijkstra section, never here. No metric, launch date or user count is stated,
 * because none was supplied, so `impact` stays empty.
 *
 * The current role started on 24 November 2025 and is ongoing, so its `period` has no `end`. The model keeps
 * months only. None of the earlier employers may ever be presented as the current employer.
 *
 * BugendaiTech: hired as Senior Developer and promoted to Lead (the owner's words, 2026-09-28); the
 * promotion date was not supplied, so only the fact of it is shown.
 */
export const experience: readonly Experience[] = [
  {
    id: "telus-digital",
    company: "Telus Digital",
    role: "Application Development Lead",
    period: { start: "2025-11" },
    location: "Noida, India",
    workMode: "Remote",
    summary:
      "Development lead for a five-developer team within a 30–40 person project: hands-on in the codebase, while handling the team and the client.",
    impact: [],
    leadership: {
      teamSize: 5,
      scope: "Leads a five-developer team within a 30–40 person project team.",
    },
    projectIds: ["dijkstra"],
    responsibilities: [
      {
        title: "Feature development",
        detail: "Developing application features hands-on, from requirement to release.",
      },
      {
        title: "Problem solving",
        detail:
          "Resolving major application problems, including performance issues and hard-to-trace bugs.",
      },
      {
        title: "Refactoring",
        detail:
          "Refactoring existing code into cleaner, reusable components, with test cases around it.",
      },
      {
        title: "Project suggestions",
        detail: "Proposing technical improvements and better approaches for the product.",
      },
      {
        title: "Team management",
        detail:
          "Managing a five-developer team: unblocking developers and giving technical direction on their tickets.",
      },
      {
        title: "Pull-request reviews",
        detail: "Reviewing the team's pull requests and giving technical feedback.",
      },
      {
        title: "Client handling",
        detail: "Handling client communication on requirements, priorities and progress.",
      },
    ],
    project: {
      name: "Dijkstra",
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
      outcome:
        "A smoother, more stable offline-first app: new features developed, performance issues resolved, bugs fixed, test cases added, and existing code refactored into cleaner, reusable components.",
    },
    // Core stack only. These ids match the portfolio skills, so the integrity tests can check them.
    stack: ["react-native", "react", "typescript"],
    status: "published",
  },
  {
    id: "bugendaitech",
    company: "BugendaiTech",
    role: "Lead Developer",
    promotedFrom: "Senior Developer",
    period: { start: "2021-12", end: "2025-11" },
    location: "Pune, India",
    workMode: "Remote",
    deployedTo: ["PwC"],
    summary:
      "Client-facing technical lead across mobile and web projects: from requirements and estimates to architecture, task planning and hands-on development.",
    impact: [],
    responsibilities: [
      {
        title: "Client management",
        detail:
          "Working directly with clients: gathering project requirements, proposing solutions and agreeing tasks and scope.",
      },
      {
        title: "Estimation",
        detail: "Estimating projects and features before development starts.",
      },
      {
        title: "Architecture",
        detail: "Designing the application architecture and project structure.",
      },
      {
        title: "Task distribution",
        detail: "Breaking work down and distributing tasks across the team.",
      },
      {
        title: "Task reviews",
        detail: "Reviewing the team's completed tasks before they ship.",
      },
      {
        title: "Team management",
        detail: "Managing the team on client projects and internal work.",
      },
      {
        title: "Development",
        detail: "Hands-on feature development in React Native and React.js.",
      },
    ],
    stack: [],
    status: "published",
  },
  {
    id: "sisgain",
    company: "Sisgain",
    role: "React Native Developer",
    period: { start: "2021-04", end: "2021-11" },
    location: "Noida, India",
    workMode: "On-site",
    summary:
      "A fast-paced role building many React Native applications to tight deadlines, often as the only developer on the project.",
    impact: [],
    responsibilities: [
      {
        title: "Application development",
        detail: "Building complete React Native applications end to end.",
      },
      {
        title: "Feature development",
        detail: "Creating application features across multiple apps.",
      },
      {
        title: "Debugging",
        detail: "Finding and fixing bugs across the applications.",
      },
      {
        title: "Working under pressure",
        detail: "Shipping several applications to tight deadlines.",
      },
      {
        title: "Client communication",
        detail: "Communicating with clients on requirements and progress.",
      },
    ],
    stack: [],
    status: "published",
  },
  {
    id: "candour-software",
    company: "Candour Software",
    role: "React Native Developer",
    period: { start: "2020-08", end: "2021-03" },
    location: "Noida, India",
    workMode: "On-site",
    summary:
      "First professional role and the start of React Native work: building mobile apps and learning how production software is made.",
    impact: [],
    responsibilities: [
      {
        title: "React Native development",
        detail: "Building mobile app screens and features in React Native.",
      },
      {
        title: "API integration",
        detail: "Integrating backend APIs into the apps.",
      },
      {
        title: "Mobile fundamentals",
        detail: "Learning the languages, tooling and platform basics behind mobile apps.",
      },
      {
        title: "Team workflow",
        detail: "Learning how development work is planned, built and reviewed in a team.",
      },
    ],
    stack: [],
    status: "published",
  },
];
