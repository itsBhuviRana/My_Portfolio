# Content Checklist Specification

- **Status:** a specification and blank checklist. **It supplies no content.** Nothing here invents personal
  information, employers, clients, projects, technologies, metrics or achievements.
- **Date:** 2026-09-19
- **Source:** Phase 2 Specification Revision 2 (section 2), the approval worksheet, and the approval record
  in [brand-guide.md](../brand/brand-guide.md).
- **Purpose:** to list what the owner needs to supply for the site, when each item is needed, and where it
  will live in the content data.
- **Rule:** anything not explicitly supplied is **INPUT REQUIRED**. Copy is drafted only from what the owner
  provides, and the owner approves the wording.
- Projects have their own template: [project-intake.md](project-intake.md).

## 1. Markers

| Marker             | Meaning                                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| **CONFIRMED**      | Supplied by the owner in the project context. The value is shown               |
| **INPUT REQUIRED** | Information only the owner can supply                                          |
| **OPTIONAL**       | Not needed unless the owner wants it shown                                     |
| **NOT DECIDED**    | An open question about where something lives. This document does not answer it |

## 2. Needed by phase

### 2.1 Supplied for the Phase 2 wordmark and monogram review

| Item                                     | Status                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Display form of the name (full or short) | **CONFIRMED:** Bhuvneshwar Rana (the full name)                                                                               |
| Initials                                 | **CONFIRMED:** BR                                                                                                             |
| Nickname                                 | **CONFIRMED as supplied:** Bhuvi. Not used by the selected wordmark (W-A) or monogram (M-B). Any use of it is **NOT DECIDED** |

### 2.2 Needed before Phase 3 (Design System + Visual Language)

**No personal or project content is needed before Phase 3.**

### 2.3 Needed before Phase 4 (Hero + Main Portfolio)

The items marked "Phase 4" in section 3, plus the project material in [project-intake.md](project-intake.md)
(section 5 there).

### 2.4 Optional or deferrable

See section 4.

## 3. Checklist by area

### 3.1 Identity

| Item                | Content field                   | Status                                                                                                                                   | Needed by |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Display name        | `Site.name`                     | **CONFIRMED:** Bhuvneshwar Rana. The full name is confirmed as the display form                                                          | Provided  |
| Initials            | Not in the content model        | **CONFIRMED:** BR                                                                                                                        | Provided  |
| Nickname            | Not in the content model        | **CONFIRMED as supplied:** Bhuvi. Not used by W-A or M-B. Any use is **NOT DECIDED**                                                     | Provided  |
| Professional title  | `Site.role`                     | **CONFIRMED:** Application Module Development Lead                                                                                       | Provided  |
| Headline            | `Site.headline`                 | **CONFIRMED (temporary):** "React Native & React Developer · Application Module Development Lead". Approve or revise: **INPUT REQUIRED** | Phase 4   |
| Short introduction  | `Site.summary.short` and `long` | **INPUT REQUIRED.** 2 to 3 sentences, 45 words or fewer, plain language, no unverifiable claims                                          | Phase 4   |
| About text          | Not in the content model        | **INPUT REQUIRED.** About 150 to 250 words: how you got here, what you care about, how you lead, off-duty                                | Phase 4   |
| Interests           | Not in the content model        | **INPUT REQUIRED.** 3 to 5                                                                                                               | Phase 4   |
| Tone words          | Not in the content model        | **INPUT REQUIRED.** 3 words                                                                                                              | Phase 4   |
| Proof-strip numbers | Not in the content model        | **INPUT REQUIRED** only if you want a proof strip. 3 to 4 numbers that are true and citable                                              | Phase 4   |

Where the About text, interests, tone words and proof numbers live in the content model is **NOT DECIDED**.
The current `Site` type has no field for them, and adding one needs its own approval.

### 3.2 Skills

| Item                            | Content field | Status                                                                          | Needed by |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------- | --------- |
| React Native, React, TypeScript | `skillGroups` | **CONFIRMED** as skills you supplied. Proficiency levels are optional and unset | Provided  |
| Any other skills to list        | `skillGroups` | **INPUT REQUIRED** (only if you want more than the three above)                 | Phase 4   |
| Proficiency levels              | `Skill.level` | **OPTIONAL**. The field is optional and stays unset unless you provide it       | Optional  |

### 3.3 Contact

| Item                   | Content field                  | Status                                                                                                             | Needed by |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------- |
| Email to publish       | `socials` (`email`, `mailto:`) | **INPUT REQUIRED**                                                                                                 | Phase 4   |
| GitHub                 | `socials` (`github`)           | Your GitHub username is **CONFIRMED** as `itsBhuviRana`. Whether this profile URL is published: **INPUT REQUIRED** | Phase 4   |
| LinkedIn               | `socials` (`linkedin`)         | **INPUT REQUIRED**                                                                                                 | Phase 4   |
| Résumé PDF             | Asset BR-06                    | **INPUT REQUIRED.** Your current file, with personal metadata stripped                                             | Phase 4   |
| Other socials, website | `socials`                      | **OPTIONAL**                                                                                                       | Optional  |
| Calendar link          | Not in the content model       | **OPTIONAL**                                                                                                       | Optional  |
| Location and timezone  | `Site.location`                | **OPTIONAL**                                                                                                       | Optional  |
| Availability           | `Site.availability`            | **OPTIONAL**                                                                                                       | Optional  |

Links must be `https:` (or `mailto:` for email). No email or profile URL is invented.

### 3.4 Experience (Release notes)

Repeat for each role you want shown.

| Item                                               | Content field                   | Status                                                            | Needed by |
| -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- | --------- |
| Current role title                                 | `Experience.role`               | **CONFIRMED:** Application Module Development Lead                | Provided  |
| Company                                            | `Experience.company`            | **INPUT REQUIRED.** Only an employer you are cleared to name      | Phase 4   |
| Dates                                              | `Experience.period`             | **INPUT REQUIRED** (`YYYY-MM`)                                    | Phase 4   |
| Summary                                            | `Experience.summary`            | **INPUT REQUIRED**                                                | Phase 4   |
| Impact, with sources                               | `Experience.impact`             | **INPUT REQUIRED.** Only true statements you can source           | Phase 4   |
| Leadership scope (team size, ownership, mentoring) | `Experience.leadership`         | **INPUT REQUIRED**                                                | Phase 4   |
| Technologies used                                  | `Experience.stack`              | **INPUT REQUIRED.** Only what you actually used in that role      | Phase 4   |
| Other roles to include                             | `experience`                    | **INPUT REQUIRED.** Which roles, if any                           | Phase 4   |
| Employer clearance                                 | Recorded in the intake or notes | **INPUT REQUIRED.** Which employers and work you may name or show | Phase 4   |

### 3.5 Projects

Use [project-intake.md](project-intake.md). Up to 5 projects, and fewer is fine. Nothing is supplied yet.

## 4. Optional or deferrable

| Item                                                                                       | Deferred until                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| A client offering or freelance copy, if you want one shown                                 | Only if wanted. Where it lives is **NOT DECIDED** |
| Achievements (awards, talks, open source, mentoring, certifications)                       | **OPTIONAL**. Where they live is **NOT DECIDED**  |
| Skill proficiency levels                                                                   | Optional                                          |
| Availability, location and timezone, calendar link, socials beyond GitHub, LinkedIn, email | Whenever you want them shown                      |
| Screen recordings and X-Ray annotation data                                                | Phase 5                                           |
| Architecture descriptions, before/after data, case-study imagery                           | Phase 6                                           |
| A runnable React Native demo app                                                           | Later, unscheduled                                |
| Repository visibility, and the open Phase 1 CI failure                                     | Phase 8, outside this checklist                   |

**No photographs of you are needed for the site.** The site uses a stylised character. Reference photos for
the character are handled privately and are not committed (see [character-bible.md](../brand/character-bible.md)).

## 5. Rules for content

| Rule                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing is invented. Every fact, number and claim traces to something the owner supplied                                                                              |
| Every metric has a source, a method and a date. Otherwise it is not used                                                                                              |
| Only employers and projects the owner is cleared to name or show appear                                                                                               |
| Placeholders use the `[[DRAFT]]` marker in code and never reach production                                                                                            |
| An entry is `published` only when it is real and complete. The integrity tests then require a valid period, non-blank fields, alt text on images, and no draft marker |
| Alt text and descriptions are written for images, diagrams and video, and stored with the content                                                                     |
| Copy is drafted from the owner's inputs only, and **the owner approves the wording** before it is used                                                                |
| Links use `https:` (or `mailto:`)                                                                                                                                     |

## 6. Change log

| Date       | Change                                                   |
| ---------- | -------------------------------------------------------- |
| 2026-09-19 | Initial Content Checklist Specification, blank checklist |
