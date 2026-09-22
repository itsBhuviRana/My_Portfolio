import type { CapabilityGroup } from "../types";

/**
 * Engineering capabilities from across the career, from the confirmed list only. These are not attached
 * to any project, and no proficiency level is claimed. Not every item applies to every project.
 */
export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    id: "application-development",
    label: "Application development",
    items: [
      "React Native",
      "React Native CLI",
      "Expo",
      "TypeScript",
      "State management",
      "Reusable component architecture",
      "Code refactoring",
      "Performance optimization",
      "Pull-request review and technical guidance",
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    items: [
      "Payment gateway integrations",
      "Stripe",
      "Notification services",
      "Third-party integrations",
      "Salesforce integrations",
      "Video calling, including Agora",
      "Text and chat integrations",
      "Authentication and security-related mobile services",
    ],
  },
  {
    id: "native-platform",
    label: "Native platform",
    items: [
      "iOS",
      "Android",
      "Swift",
      "Kotlin",
      "Xcode",
      "Android Studio",
      "Native platform integration",
    ],
  },
  {
    id: "web",
    label: "Web",
    items: ["React.js", "Next.js", "Vue.js", "Node.js"],
  },
  {
    id: "data-apis",
    label: "Data / APIs",
    items: [
      "API integration",
      "GraphQL integrations",
      "OpenAPI-based integrations",
      "SQLite",
      "Local data handling",
    ],
  },
  {
    id: "testing-quality",
    label: "Testing / Quality",
    items: ["Testing tools", "Jest", "Detox", "Storybook", "ESLint", "Prettier", "CodeQL"],
  },
  {
    id: "delivery-release",
    label: "Delivery / Release",
    items: [
      "CI/CD",
      "GitHub Actions",
      "App Store deployment and release",
      "Google Play deployment and release",
      "App Store and Play Store services",
      "Mobile certificate and signing work",
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    items: [
      "Server build and configuration",
      "AWS (server deployment and configuration knowledge)",
    ],
  },
];
