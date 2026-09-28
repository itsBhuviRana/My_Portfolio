import type { AtlasProject } from "../types";

/** The company name used for freelance work. Internal: the summary selector uses it to count freelance projects. */
export const FREELANCE = "Freelance";

/**
 * The career project atlas. Every optional field is present only when it was confirmed, and periods are
 * approximate years that sit inside the owner's career dates (see experience.ts): Candour Software
 * Aug 2020–Mar 2021, Sisgain Apr–Nov 2021, BugendaiTech Dec 2021–Nov 2025 (deployed to PwC for IFL and
 * Coca-Cola, 2024–2025, hence `via`), Telus Digital from Nov 2025. Freelance work ran alongside, 2021–2022.
 *
 * How the text is written (the tests enforce most of it):
 *   - `personalWork`, `notableWork`, `technologies`, `product` and `framework` are CONFIRMED facts only.
 *   - `summary` is an editorial description built from the owner's own account of the work, in technical
 *     terms. Where product details are unknown it is a general engineering description from the confirmed
 *     work patterns (feature development, API integration, reusable components), and it never names a
 *     client, a user count, a metric, a product feature or a technology that was not confirmed for that
 *     project. BT-Evolve's "React-based" is wording the owner supplied.
 *   - `domain` is cautious. `domainFromName` marks a domain that the project name alone indicates.
 *
 * Deliberately NOT recorded (not supplied): client names other than the ones stated, user counts, team
 * sizes, outcomes, the full stack of any project beyond the lists below, and which native modules were
 * personally written on JSW Connection.
 *
 * BT-Ohana / HRMS: confirmed by the owner as a company's internal platform for its own employees, through
 * which they study for and complete certifications. It is not a student application and has no confirmed HR
 * modules (payroll, attendance, recruitment), so none are named.
 */
export const atlasProjects: readonly AtlasProject[] = [
  // ── Featured ──────────────────────────────────────────────────────────────
  {
    id: "dijkstra",
    name: "Dijkstra",
    company: "Telus Digital",
    client: "Talis Agriculture",
    platform: "mobile",
    tier: "featured",
    summary:
      "Offline-first field-management application for agronomists and farmers, with local SQLite persistence, backend synchronization and maps. Multi-tenant, white-label and built for iOS and Android.",
    domain: "Agriculture",
    years: { from: 2025, to: "present" },
    framework: "React Native + Expo",
    product: "Mobile agriculture field-management application",
    // Titles match the current role's responsibilities. The full breakdown is the Dijkstra section.
    personalWork: ["Feature development", "Refactoring", "Pull-request reviews", "Team management"],
    notableWork: [
      "Offline-first, with local SQLite persistence",
      "Synchronization with the backend when online",
      "Multi-tenant and white-label",
    ],
    technologies: ["React Native", "Expo", "React", "TypeScript"],
  },
  {
    id: "ifl",
    name: "IFL",
    company: "PwC",
    via: "BugendaiTech",
    enterpriseClient: "PwC",
    platform: "mobile",
    tier: "featured",
    summary:
      "Mobile banking application built with React Native CLI for financial workflows. Developed KYC functionality and financial calculators, integrated an AI chatbot and backend services, and added test cases alongside bug fixes.",
    domain: "Banking",
    years: { from: 2024, to: 2025 },
    framework: "React Native CLI",
    product: "Banking application",
    personalWork: [
      "Feature development",
      "KYC functionality",
      "AI chatbot integration",
      "Service integrations",
      "Test cases",
      "Bug fixing",
    ],
    notableWork: ["KYC features", "Financial calculators", "AI chatbot integration"],
    // Only these four were supplied. Other technologies were used but are not individually confirmed.
    technologies: ["React Native", "GraphQL", "SQLite", "TypeScript"],
  },
  {
    id: "coca-cola",
    name: "Coca-Cola",
    company: "PwC",
    via: "BugendaiTech",
    enterpriseClient: "Coca-Cola",
    platform: "mobile",
    tier: "featured",
    summary:
      "Customer management application built with React Native CLI and TypeScript, connected to Salesforce. Developed features, integrated an AI chatbot and backend services, and added test cases and bug fixes, alongside native iOS and Android integration.",
    domain: "Customer management",
    years: { from: 2024, to: 2025 },
    framework: "React Native CLI",
    product: "Customer management application",
    personalWork: [
      "Feature development",
      "AI chatbot integration",
      "Service integrations",
      "Test cases",
      "Bug fixing",
    ],
    notableWork: [
      "Salesforce integration",
      "Native iOS integration",
      "Native Android integration",
      "AI chatbot integration",
    ],
    technologies: ["React Native CLI", "Salesforce", "TypeScript"],
  },
  {
    id: "pinpoinx",
    name: "Pinpoinx",
    company: "BugendaiTech",
    platform: "mobile",
    tier: "featured",
    summary:
      "Real-estate application for selling homes, built with React Native CLI. Designed the application architecture, project structure and backend, and developed features including payment gateway and API integration.",
    domain: "Real estate",
    years: { from: 2021, to: 2024 },
    framework: "React Native CLI",
    product: "Real-estate sales application",
    personalWork: [
      "Architecture design",
      "Project structure",
      "Backend design",
      "Feature development",
    ],
    notableWork: ["Payment gateway integration", "API integration"],
    technologies: ["React Native CLI", "GraphQL", "SQLite", "TypeScript"],
  },
  {
    id: "jsw-connection",
    name: "JSW Connection",
    company: "BugendaiTech",
    enterpriseClient: "JSW",
    platform: "mobile",
    tier: "featured",
    summary:
      "Customer service mobile application in the native Android (Kotlin) and iOS (Swift) ecosystem, integrated with Salesforce. Designed the application architecture and set up and maintained the project structure, alongside feature development.",
    domain: "Customer service",
    years: { from: 2023, to: 2024 },
    product: "Customer service application",
    personalWork: [
      "Architecture design",
      "Project structure management",
      "Feature development across multiple application features",
    ],
    // Native technologies of the project. It is not claimed that every native module was personally written.
    technologies: ["Android / Kotlin", "iOS / Swift", "Salesforce"],
  },

  // ── Standard: a domain or some confirmed detail beyond the name ────────────
  {
    id: "poito",
    name: "Poito",
    company: "BugendaiTech",
    platform: "web",
    tier: "index",
    summary:
      "Student study web application built with React.js and Node.js APIs. Work involved feature development, reusable UI components and API-driven functionality.",
    domain: "Education",
    years: { from: 2022, to: 2025 },
    framework: "React.js",
    product: "Student study application",
    personalWork: ["Feature development"],
    technologies: ["React.js", "Node.js APIs"],
  },
  {
    id: "bt-ohana-hrms",
    name: "BT-Ohana / HRMS",
    company: "BugendaiTech",
    platform: "web",
    tier: "index",
    summary:
      "Internal employee learning platform built with React.js and React Native, through which a company's employees study for and complete certifications. Work involved feature development, reusable components and API-driven application behavior.",
    domain: "Employee learning",
    years: { from: 2022, to: 2024 },
    framework: "React.js + React Native",
    product: "Internal employee learning and certification platform",
    personalWork: ["Feature development"],
  },
  {
    id: "admedic",
    name: "AdMedic",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Healthcare mobile application developed end to end as the sole developer, covering the full build: UI, application features and API integration.",
    domain: "Healthcare",
    years: { from: 2021, to: 2021 },
    product: "Healthcare application",
    personalWork: ["Sole developer, end to end"],
  },
  {
    id: "virtu-md",
    name: "Virtu MD",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Healthcare mobile application developed end to end as the sole developer, with audio and video calling, text chat, payment gateway integration and background API processing.",
    domain: "Healthcare",
    years: { from: 2021, to: 2021 },
    product: "Healthcare application",
    personalWork: ["Sole developer, end to end"],
    notableWork: [
      "Audio calling",
      "Video calling",
      "Text chat",
      "Payment gateway integration",
      "Background API processing",
    ],
  },
  {
    id: "desh-clinic",
    name: "Desh Clinic",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Clinic-focused healthcare mobile application developed end to end as the sole developer, with audio and video calling, text chat, payment gateway integration and background API processing.",
    domain: "Healthcare",
    years: { from: 2021, to: 2021 },
    product: "Healthcare application",
    personalWork: ["Sole developer, end to end"],
    notableWork: [
      "Audio calling",
      "Video calling",
      "Text chat",
      "Payment gateway integration",
      "Background API processing",
    ],
  },
  {
    id: "gomotorcar",
    name: "GoMotorCar",
    company: FREELANCE,
    platform: "web",
    tier: "index",
    summary:
      "Service-provider application for car-wash services, built as a complete application end to end.",
    domain: "Car-wash services",
    years: { from: 2021, to: 2022 },
    product: "Car-wash service-provider application",
    personalWork: ["Complete application build"],
  },
  {
    id: "music-pie",
    name: "Music Pie",
    company: FREELANCE,
    platform: "mobile",
    tier: "index",
    summary: "Song and music mobile application, built as a complete application end to end.",
    domain: "Music",
    years: { from: 2021, to: 2022 },
    product: "Song / music application",
    personalWork: ["Complete application build"],
  },
  {
    id: "agropure",
    name: "AgroPure",
    company: "Candour Software",
    platform: "mobile",
    tier: "index",
    summary:
      "Inventory mobile application through which the company tracks its stock: what is still available and what is running low.",
    domain: "Inventory management",
    years: { from: 2020, to: 2021 },
    product: "Inventory / stock-tracking application",
  },
  {
    id: "hindware",
    name: "Hindware",
    company: "Candour Software",
    platform: "mobile",
    tier: "index",
    summary:
      "Customer service mobile application for Hindware, involving feature development and mobile engineering.",
    domain: "Customer service",
    years: { from: 2020, to: 2021 },
    product: "Customer service application",
  },

  // ── Register: name, company and platform only, with a general engineering summary ──
  {
    id: "bt-evolve",
    name: "BT-Evolve",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    // "React-based" is the owner's own wording for this project.
    summary:
      "Web application involving React-based feature development, reusable interface patterns and API-driven workflows.",
  },
  {
    id: "bt-reward",
    name: "BT-Reward",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    summary:
      "Web application involving feature development, reusable interface patterns and API-driven workflows.",
  },
  {
    id: "bt-review",
    name: "BT-Review",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    summary:
      "Web application development covering feature implementation and API-driven functionality.",
  },
  {
    id: "flaia",
    name: "Flaia",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    summary:
      "Web application involving feature development, reusable interface patterns and API-driven workflows.",
  },
  {
    id: "fish-ferry",
    name: "Fish / Ferry",
    company: "BugendaiTech",
    platform: "mobile",
    tier: "register",
    summary:
      "Mobile application involving feature development, API integration and reusable application components.",
  },
  {
    id: "magwitch",
    name: "Magwitch",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    summary:
      "Web application development covering feature implementation and API-driven functionality.",
  },
  {
    id: "notaroo",
    name: "Notaroo",
    company: "BugendaiTech",
    platform: "mobile",
    tier: "register",
    summary: "Mobile application work centered on feature development and API-driven screens.",
  },
  {
    id: "living-box",
    name: "Living Box",
    company: "BugendaiTech",
    platform: "web",
    tier: "register",
    summary:
      "Web application involving feature development, reusable interface patterns and API-driven workflows.",
  },
  {
    id: "cpc-sisgain",
    name: "CPC-Sisgain",
    company: "Sisgain",
    platform: "mobile",
    tier: "register",
    summary: "Mobile application development covering feature implementation and API integration.",
  },
  {
    id: "dr-labike",
    name: "Dr LaBike",
    company: "Sisgain",
    platform: "mobile",
    tier: "register",
    summary:
      "Mobile application involving feature development, API integration and reusable application components.",
  },
  {
    id: "wosh-app",
    name: "Wosh App",
    company: FREELANCE,
    platform: "mobile",
    tier: "register",
    summary: "Mobile application work centered on feature development and API-driven screens.",
  },
  {
    id: "curetus-app",
    name: "Curetus App",
    company: FREELANCE,
    platform: "mobile",
    tier: "register",
    summary: "Mobile application development covering feature implementation and API integration.",
  },
  {
    id: "juntoplus",
    name: "JuntoPlus",
    company: FREELANCE,
    platform: "mobile",
    tier: "register",
    summary:
      "Mobile application involving feature development, API integration and reusable application components.",
  },
  {
    id: "vistara",
    name: "Vistara",
    company: FREELANCE,
    platform: "mobile",
    tier: "register",
    summary: "Mobile application work centered on feature development and API-driven screens.",
  },
];

/**
 * The frameworks and platforms the work spans, as a short range for the atlas overview. Every item also
 * appears in the capability groups (a test checks this). It does not say which project used which.
 */
export const careerRange: readonly string[] = [
  "React Native",
  "React Native CLI",
  "Expo",
  "React.js",
  "Next.js",
  "Vue.js",
  "Node.js",
];
