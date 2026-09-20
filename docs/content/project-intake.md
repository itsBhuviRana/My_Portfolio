# Project Intake Specification (PR-01)

- **Status:** a blank template and specification. **It contains no project data.** Nothing here describes a
  real project, employer, client, technology, metric or achievement.
- **Date:** 2026-09-19
- **Source:** Phase 2 Specification Revision 2 (sections 5 and 9), and the approval record in
  [brand-guide.md](../brand/brand-guide.md).
- **Purpose:** to collect, per project, everything needed to publish it honestly, and to record whether the
  owner is allowed to publish it at all.
- **Rule:** every value the owner has not supplied is **INPUT REQUIRED**. Nothing is invented, guessed or
  inferred. Placeholder values in code use the `[[DRAFT]]` marker and never reach production.

## 1. How to use this document

1. Decide how many projects to include: **up to 5, and fewer is fine**.
2. For each project, copy the template in section 4 and fill it in.
3. Complete the **clearance gate** (section 3) first. If a project is not publishable, stop there.
4. Supply media as described in section 6. Nothing is needed earlier than its phase.
5. Nothing is published until the owner marks the entry `published` and it passes the content integrity
   tests (period present, no blank fields, alt text on images, no `[[DRAFT]]` marker).

## 2. Markers

| Marker             | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| **CONFIRMED**      | Decided in the project context or approval record        |
| **PROPOSED**       | A rule from Revision 2, working contract unless changed  |
| **INPUT REQUIRED** | Information only the owner can supply                    |
| **NOT DECIDED**    | An open question this document flags and does not answer |

## 3. Clearance gate (complete before anything else)

Answer for each project. Every answer is **INPUT REQUIRED**.

| #   | Question                                                                                          | Answer             |
| --- | ------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Who owns the work: an employer, a client, or you?                                                 | **INPUT REQUIRED** |
| 2   | Do you have written permission to publish it, and to name the employer or client?                 | **INPUT REQUIRED** |
| 3   | May real screens be shown, or only sanitised or redrawn ones?                                     | **INPUT REQUIRED** |
| 4   | Do any screens, recordings or diagrams show real user data, credentials, tokens or private URLs?  | **INPUT REQUIRED** |
| 5   | Do you own, or may you use, every image, icon, font or third-party asset visible in the material? | **INPUT REQUIRED** |
| 6   | If a repository link is planned, is the code yours to publish, and under which licence?           | **INPUT REQUIRED** |
| 7   | Is the product still live, and may its store or live link be shown?                               | **INPUT REQUIRED** |
| 8   | Are metrics you want to cite confidential?                                                        | **INPUT REQUIRED** |

**Clearance result (owner chooses one):** `public, named` · `public, NDA-abstracted` · `not publishable`

- `NDA-abstracted` means the project is shown without identifying details. The `NDA-abstracted` badge is
  used **only where this is true**.
- A `not publishable` project is left out entirely.

## 4. Project template (one copy per project)

Every value is **INPUT REQUIRED** until the owner supplies it.

### 4.1 Identity and scope

| Field       | Guidance                                              | Content model field  | Value              |
| ----------- | ----------------------------------------------------- | -------------------- | ------------------ |
| Title       | Public name (or an abstracted name if NDA-abstracted) | `Project.title`      | **INPUT REQUIRED** |
| Slug        | Lowercase words joined by hyphens, unique             | `Project.slug`       | **INPUT REQUIRED** |
| One-liner   | One sentence: what it is and the outcome              | `Project.oneLiner`   | **INPUT REQUIRED** |
| Category    | `mobile`, `web` or `architecture`                     | `Project.category`   | **INPUT REQUIRED** |
| Your role   | Your actual role on this project                      | `Project.role`       | **INPUT REQUIRED** |
| Period      | Start month, and end month if it ended (`YYYY-MM`)    | `Project.period`     | **INPUT REQUIRED** |
| Team size   | Number of people, if you want it shown                | Not in the model yet | **INPUT REQUIRED** |
| Platform(s) | For example the platforms it ships on                 | Not in the model yet | **INPUT REQUIRED** |
| Still live? | Yes or no                                             | Not in the model yet | **INPUT REQUIRED** |
| Featured?   | Whether it should be highlighted                      | `Project.featured`   | **INPUT REQUIRED** |

### 4.2 Story

| Field                      | Guidance                                                             | Value              |
| -------------------------- | -------------------------------------------------------------------- | ------------------ |
| Your specific contribution | What **you** did, not what the team did                              | **INPUT REQUIRED** |
| The problem                | What needed solving, and for whom                                    | **INPUT REQUIRED** |
| Constraints                | Time, platform, legacy, team, compliance, and so on                  | **INPUT REQUIRED** |
| Key decisions (2 to 4)     | Each with: the context, the decision, and the trade-off you accepted | **INPUT REQUIRED** |
| Outcome                    | What changed as a result                                             | **INPUT REQUIRED** |

### 4.3 Metrics (only numbers you can stand behind)

Each metric needs **all** of the following, or it is not used.

| Field  | Guidance                         | Value              |
| ------ | -------------------------------- | ------------------ |
| Label  | What is measured                 | **INPUT REQUIRED** |
| Value  | The number, with its unit        | **INPUT REQUIRED** |
| Source | Where the number comes from      | **INPUT REQUIRED** |
| Method | How it was measured              | **INPUT REQUIRED** |
| Date   | When it was measured (`YYYY-MM`) | **INPUT REQUIRED** |

The current content model has only `label` and `value` for a metric. Where source, method and date are
stored is **NOT DECIDED** (see section 8).

### 4.4 Technology and links

| Field             | Guidance                                                                             | Content model field   | Value              |
| ----------------- | ------------------------------------------------------------------------------------ | --------------------- | ------------------ |
| Technologies used | Only what you actually used. Each must match a skill that exists in the content data | `Project.stack`       | **INPUT REQUIRED** |
| Store link        | Only if cleared                                                                      | `Project.links.store` | **INPUT REQUIRED** |
| Live link         | Only if cleared                                                                      | `Project.links.live`  | **INPUT REQUIRED** |
| Repository link   | Only if cleared (clearance question 6)                                               | `Project.links.repo`  | **INPUT REQUIRED** |

Links must be `https:` URLs. Technologies appear as **text chips only**, never logos.

### 4.5 Status

| Field            | Guidance                                             | Value              |
| ---------------- | ---------------------------------------------------- | ------------------ |
| Entry status     | `draft` until complete and cleared, then `published` | `draft`            |
| Clearance result | From section 3                                       | **INPUT REQUIRED** |

## 5. Which phase needs what

| Item                                                                          | Needed by                  |
| ----------------------------------------------------------------------------- | -------------------------- |
| Clearance gate and the section 4 fields for each project you want on the site | **Phase 4** (Work cards)   |
| At least 3 screenshots per project                                            | **Phase 4**                |
| A screen recording (at least 1 for the flagship)                              | **Phase 5** (Device Stage) |
| X-Ray annotation data (section 7.1)                                           | **Phase 5**                |
| Architecture description, before/after data, case-study images                | **Phase 6**                |

Nothing beyond the Phase 4 items is needed before Phase 4.

## 6. Media requirements (PROPOSED, from Revision 2)

| Asset                | Requirement                                                                                                                                                        | Register ID |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Screenshots          | At least 3 per project: home, key flow, detail. Device-native capture, clean status bar, sanitised data, light mode. Delivered 390 and 780 px wide, AVIF plus WebP | PR-02       |
| Screen recording     | 8 to 30 seconds, portrait, silent. Delivered 720×1560, 30 fps, MP4 plus WebM, 3 MB or less each, plus a poster image                                               | PR-03       |
| Architecture diagram | The owner supplies a written description: modules, data flow, boundaries. It is redrawn in the project's illustration style                                        | PR-04       |
| X-Ray annotations    | Per screen, a list of regions (section 7.1)                                                                                                                        | PR-05       |
| Before / after       | A pair or a chart, with environment and method (section 7.2)                                                                                                       | PR-06       |
| Case-study imagery   | 3 to 6 images or diagrams per case study                                                                                                                           | PR-07       |

Thumbnails are composed in HTML from the screenshots, so they need no separate image. Raw originals stay out
of git. The acceptance checklists D, E and H in [asset-register.md](../brand/asset-register.md) apply to all
material.

## 7. Proposed schemas (documented only, NOT implemented)

**No type or code has been added.** `@assembly/content` is unchanged. These are proposals for later, and any
change to the content model needs its own approval gate (AG-6): X-Ray in Phase 5, before/after in Phase 6.

### 7.1 X-Ray overlay

Proposed as a new media kind `xray`.

| Field     | Type           | Rule                                                   |
| --------- | -------------- | ------------------------------------------------------ |
| `id`      | string         | Unique                                                 |
| `mediaId` | string         | Must reference an existing `image` or `video` media id |
| `regions` | list of region | At least 1                                             |

Each region:

| Field            | Type                                 | Rule                                                                   |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| `id`             | string                               | Unique within the overlay                                              |
| `label`          | string                               | Component or module name                                               |
| `rect`           | `{x, y, width, height}`              | Percentages 0 to 100, inside the frame                                 |
| `layer`          | one of the six frozen layer IDs      | `interface`, `components`, `state`, `native`, `delivery`, `leadership` |
| `responsibility` | string                               | Non-blank                                                              |
| `stateSource`    | string, optional                     |                                                                        |
| `description`    | string                               | Accessible text for the region                                         |
| `metric`         | `{label, value, method, measuredOn}` | Optional, and allowed **only** with a method and a date                |

Owner input template, one row per region (all **INPUT REQUIRED**): label, position on the screen, layer,
responsibility, state source, description, optional measured metric with method and date.

### 7.2 Before / after

Proposed as a new media kind `comparison`.

| Field                    | Type                      | Rule                               |
| ------------------------ | ------------------------- | ---------------------------------- |
| `id`, `label`            | string                    | Unique id                          |
| `before`, `after`        | media reference or metric | Both required                      |
| `method`, `environment`  | string                    | Required                           |
| `measuredOn`             | `YYYY-MM`                 | Required                           |
| `caption`, `description` | string                    | Description is the accessible text |

### 7.3 Proposed case-study blocks and integrity rules

- New blocks: `{type: 'xray', overlayId}` and `{type: 'comparison', comparisonId}`.
- Proposed integrity rules: unique ids, references resolve, percentages in range, published items require a
  description, metrics require a method and a date, no `[[DRAFT]]` marker.

## 8. Not decided

| Item                                                                                                  | Status          |
| ----------------------------------------------------------------------------------------------------- | --------------- |
| Where metric source, method and date are stored, since the current model has only `label` and `value` | **NOT DECIDED** |
| Where team size, platform(s) and "still live" are stored, since they are not in the current model     | **NOT DECIDED** |
| Whether the X-Ray and before/after schemas above are adopted as written                               | **NOT DECIDED** |

## 9. INPUT REQUIRED summary

Everything in section 4 for each project you choose to include, plus the clearance answers in section 3 and
the media in section 6, on the schedule in section 5. **No project data has been supplied yet.**

## 10. Change log

| Date       | Change                                                       |
| ---------- | ------------------------------------------------------------ |
| 2026-09-19 | Initial Project Intake Specification (PR-01), blank template |
