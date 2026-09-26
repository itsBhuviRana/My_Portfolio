import type { AtlasProject } from "../types";

/** The company name used for freelance work. Internal: the summary selector uses it to count freelance projects. */
export const FREELANCE = "Freelance";

/**
 * The career project atlas. Every optional field is present only when it was confirmed, and periods are
 * approximate years.
 *
 * How the text is written (the tests enforce most of it):
 *   - `personalWork`, `notableWork`, `technologies`, `product` and `framework` are CONFIRMED facts only.
 *   - `summary` is an editorial description. Where product details are unknown it is a general engineering
 *     description from the confirmed work patterns (feature development, API integration, reusable
 *     components). It never names a client, a user count, a metric, a product feature or a technology that
 *     was not confirmed for that project. The one exception is BT-Evolve's "React-based", which is wording
 *     the owner supplied.
 *   - `domain` is cautious. `domainFromName` marks a domain that the project name alone indicates.
 *
 * Deliberately NOT recorded (not supplied): client names other than the ones stated, user counts, team
 * sizes, outcomes, the full stack of any project beyond the lists below, and which native modules were
 * personally written on JSW Connection.
 *
 * BT-Ohana / HRMS: the supplied product description ("Study for Student") contradicts the project name, so
 * it is not used. "Internal HRMS / business application" is only a cautious contextual description.
 */
export const atlasProjects: readonly AtlasProject[] = [
  // ── Featured ──────────────────────────────────────────────────────────────
  {
    id: "dijkastra",
    name: "Dijkastra",
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
    // Titles match the current role's responsibilities. The full breakdown is the Dijkastra section.
    personalWork: [
      "Feature development",
      "Refactoring and improvements",
      "Pull-request reviews",
      "Team guidance",
    ],
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
    enterpriseClient: "PwC",
    platform: "mobile",
    tier: "featured",
    summary:
      "Mobile banking application built with React Native CLI, covering financial workflows. Feature work included KYC features and financial calculators, with GraphQL and SQLite in the stack.",
    domain: "Banking",
    years: { from: 2024, to: 2025 },
    framework: "React Native CLI",
    product: "Banking application",
    personalWork: ["Feature development"],
    notableWork: ["KYC features", "Financial calculators"],
    // Only these four were supplied. Other technologies were used but are not individually confirmed.
    technologies: ["React Native", "GraphQL", "SQLite", "TypeScript"],
  },
  {
    id: "coca-cola",
    name: "Coca-Cola",
    company: "PwC",
    enterpriseClient: "Coca-Cola",
    platform: "mobile",
    tier: "featured",
    summary:
      "Customer management application built with React Native CLI and TypeScript, connected to Salesforce. Work included native iOS and Android integration alongside cross-platform feature development.",
    domain: "Customer management",
    years: { from: 2024, to: 2025 },
    framework: "React Native CLI",
    product: "Customer management application",
    personalWork: ["Feature development"],
    notableWork: ["Salesforce integration", "Native iOS integration", "Native Android integration"],
    technologies: ["React Native CLI", "Salesforce", "TypeScript"],
  },
  {
    id: "pinpoinx",
    name: "Pinpoinx",
    company: "BugendaiTech",
    platform: "mobile",
    tier: "featured",
    summary:
      "Home broker mobile application built with React Native CLI. Work included feature development, payment gateway integration and API integration, with GraphQL and SQLite in the stack.",
    years: { from: 2022, to: 2025 },
    framework: "React Native CLI",
    product: "Home broker application",
    personalWork: ["Feature development"],
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
      "Customer service mobile application in the native Android (Kotlin) and iOS (Swift) ecosystem, integrated with Salesforce. Feature development across multiple application features.",
    domain: "Customer service",
    years: { from: 2023, to: 2024 },
    product: "Customer service application",
    personalWork: ["Feature development across multiple application features"],
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
      "Internal HRMS / business application built with React.js and React Native. Work involved feature development, reusable components and API-driven application behavior.",
    domain: "HRMS / business",
    domainFromName: true,
    years: { from: 2022, to: 2024 },
    framework: "React.js + React Native",
    personalWork: ["Feature development"],
  },
  {
    id: "admedic",
    name: "AdMedic",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Healthcare-focused mobile application involving feature development and cross-platform mobile engineering.",
    domain: "Healthcare",
    domainFromName: true,
  },
  {
    id: "virtu-md",
    name: "Virtu MD",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Healthcare-oriented mobile application involving feature development and mobile engineering.",
    domain: "Healthcare",
    domainFromName: true,
  },
  {
    id: "desh-clinic",
    name: "Desh Clinic",
    company: "Sisgain",
    platform: "mobile",
    tier: "index",
    summary:
      "Healthcare and clinic-oriented mobile application involving feature development and mobile engineering.",
    domain: "Healthcare",
    domainFromName: true,
  },
  {
    id: "gomotorcar",
    name: "GoMotorCar",
    company: FREELANCE,
    platform: "web",
    tier: "index",
    summary:
      "Automotive-oriented web application involving feature implementation, responsive interfaces and API-driven functionality.",
    domain: "Automotive",
    domainFromName: true,
  },
  {
    id: "music-pie",
    name: "Music Pie",
    company: FREELANCE,
    platform: "mobile",
    tier: "index",
    summary:
      "Music and media-oriented mobile application involving feature development and mobile engineering.",
    domain: "Music / media",
    domainFromName: true,
  },
  {
    id: "agropure",
    name: "AgroPure",
    company: "Candour Software",
    platform: "mobile",
    tier: "index",
    summary:
      "Agriculture-oriented mobile application involving feature development and mobile engineering.",
    domain: "Agriculture",
    domainFromName: true,
  },
  {
    id: "hindware",
    name: "Hindware",
    company: "Candour Software",
    platform: "mobile",
    tier: "index",
    summary:
      "Home and building products-oriented mobile application involving feature development and mobile engineering.",
    domain: "Home / building products",
    domainFromName: true,
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
