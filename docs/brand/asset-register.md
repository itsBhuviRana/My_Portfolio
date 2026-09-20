# Asset Register Specification (AR-01)

- **Status:** specification, plus the approved register rows for BR-02 and BR-03 (section 14). The only asset
  files in the repository are the four approved BR-02 and BR-03 SVGs in `docs/brand/source/` (AG-9, approved
  2026-09-20). No other asset exists, and nothing has been wired into the site.
- **Date:** 2026-09-19
- **Source:** Phase 2 Specification Revision 2 (sections 7 to 9), and the approval record in
  [brand-guide.md](brand-guide.md).
- **Purpose:** to define the register, its rules, and the **manual acceptance checklists** chosen in AG-2
  (no `check-assets` script). The register is how every asset is tracked from plan to use.
- **Rule:** nothing is invented. Anything that needs the owner's input is marked **INPUT REQUIRED**.

## 1. Format note

Revision 2 named this file `asset-register.json`. AG-2 chose a manual checklist and no script, so nothing
would read a JSON file. This register is therefore **Markdown for now**. Whether to convert it to JSON later
is **NOT DECIDED**.

## 2. Markers

| Marker             | Meaning                                                           |
| ------------------ | ----------------------------------------------------------------- |
| **CONFIRMED**      | Decided in the project context or recorded in the approval record |
| **PROPOSED**       | A rule from Revision 2. It is the working contract unless changed |
| **INPUT REQUIRED** | Information only the owner can supply                             |
| **NOT DECIDED**    | An open question this document flags and does not answer          |

## 3. Lifecycle statuses (PROPOSED)

| Status     | Meaning                                                           |
| ---------- | ----------------------------------------------------------------- |
| `planned`  | Listed in the catalogue. No file exists                           |
| `drafted`  | A file or document exists and awaits review                       |
| `approved` | The manual acceptance checklists passed and the owner accepted it |
| `wired`    | Used in the site. Set only in the phase that uses it              |

## 4. Priority and phase meaning (CONFIRMED, D12)

- **P0:** required before Hero implementation in Phase 4. Some P0 assets are produced during Phase 3.
- **P1:** required during implementation.
- **P2:** enhancement, can come later.
- **Produced in** says when the asset is made. **Needed by** says when it must be ready.

## 5. Register schema (PROPOSED)

Every file that exists gets one row with these fields.

| Field                      | Content                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `id`                       | The catalogue ID (section 12)                                                          |
| `path`                     | Repository path of the file                                                            |
| `kind`                     | Doc, Art, Code, Input                                                                  |
| `priority`                 | P0, P1 or P2                                                                           |
| `producedIn`, `neededBy`   | Phase names                                                                            |
| `sections[]`               | Site sections that use it                                                              |
| `status`                   | One of the statuses in section 3                                                       |
| `decorative`               | `true` or `false`                                                                      |
| `alt` or `longDescription` | Required when `decorative` is `false`                                                  |
| `source`                   | How it was made: tools (including any AI tool and version) and who made it             |
| `licence`                  | The terms that apply. Must give the owner commercial use and edit rights               |
| `owner`                    | Who is responsible for it                                                              |
| `budgetKB`                 | The size budget from section 8                                                         |
| `acceptance`               | Date, reviewer and which checklists passed (section 16). Added so results are recorded |

## 6. Naming conventions (PROPOSED)

| Rule          | Convention                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Names         | kebab-case, ASCII, no spaces. Pattern `<kind>-<nn>-<description>.<ext>`                          |
| Poses         | `pose-<id>.svg`. Part IDs `part-<name>`. Pivots `pivot-<name>`. Expressions `expr-<name>.svg`    |
| Rasters       | `<name>@1x.webp`, `<name>@2x.webp`                                                               |
| Icons         | `icon-<name>.svg`                                                                                |
| Brand marks   | `br-<nn>-<description>.svg`, reversed versions add `-reversed`. **APPROVED** (owner, 2026-09-20) |
| Project media | `projects/<slug>/screen-01-<desc>.avif`, `rec-01-<desc>.mp4`, `diagram-01-<desc>.svg`            |

## 7. Formats and dimensions (PROPOSED)

| Kind                         | Format                            | Dimensions / ratio          |
| ---------------------------- | --------------------------------- | --------------------------- |
| Illustrations, icons, frames | SVG                               | viewBox origin `0 0`        |
| Character poses              | SVG                               | viewBox `0 0 1200 1600`     |
| Screens                      | AVIF plus WebP                    | 390 and 780 wide, 9:19.5    |
| Wide images                  | AVIF plus WebP                    | 640, 1280 and 1920 wide     |
| Thumbnails                   | Composed in HTML from screenshots | 480, 960 and 1440 wide, 4:3 |
| OG image                     | PNG                               | 1200×630                    |
| Favicon set                  | SVG, ICO, PNG                     | 180, 192 and 512            |
| Video                        | MP4 plus WebM plus poster         | 720×1560, 30 fps            |

## 8. Compression and budgets (PROPOSED)

| Asset          | Rule                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| SVG            | 1 decimal place, IDs preserved. Pose 60 KB raw and 20 KB gzip or less. Stack 80 KB and 25 KB or less. Frame 8 KB or less. Icon 1 KB or less |
| Raster         | AVIF quality about 50 to 60, WebP about 80. Never upscale                                                                                   |
| Video          | 3 MB or less per clip, lazy-loaded, no autoplay when reduced motion or data saver is on                                                     |
| Above the fold | Illustration 60 KB gzip or less in total                                                                                                    |
| Fonts          | 160 KB of WOFF2 or less for both families. Measured in Phase 3                                                                              |
| Repository     | Committed media 50 MB or less in total. **Raw originals stay out of git**                                                                   |

## 9. Responsive variants

Delivered widths are in section 7. Rasters ship at 1x and 2x. Video has one size and a poster image.
Thumbnails are composed in HTML, so they follow the tokens and are not baked images.

## 10. Accessibility metadata rules (CONFIRMED with D3, preserved from Revision 2)

| Rule            | Requirement                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| Decorative art  | Marked `decorative: true`, rendered `aria-hidden`                                          |
| Informative art | Needs `alt` or `longDescription`. Informative SVGs get `role="img"` and an accessible name |
| Diagrams        | Labels are HTML. Each diagram has a long description                                       |
| Video           | Muted, with a visible pause control and a description                                      |
| Motion          | Every animated asset has a static, fully assembled state for reduced motion                |
| Text            | Never baked into SVG or images. No text under 12 px                                        |
| Colour          | Never the sole channel. Layer identity also uses a number, a label and a hatch pattern     |

## 11. Folder placement (PROPOSED; folders are created only when their first approved file exists)

```text
docs/brand/source/            brand masters and delivered character art (interim, per AG-1)
apps/web/src/assets/          [Phase 3+] illustration, icons, project images
apps/web/src/generated/       [Phase 3+] committed generated SVG components and CSS
apps/web/public/              [Phase 8] favicon set, og/default.png
apps/web/public/media/<slug>/ [Phase 7] optimised video and posters
packages/avatar/              [AG-1, start of Phase 4, only if justified] not created
```

Only `docs/brand/source/` exists now. It was created when the first approved files (BR-02 and BR-03, AG-9) were delivered. The other folders are not created.

## 12. Asset catalogue (planned)

No file exists for any row unless the Status column says otherwise. **Owner:** C is Claude (code-authored),
Y is the owner or their chosen route, B is both. Character art follows D4 Option C, so its "produced in" is
**external, by the Phase 4 entry gate**.

| ID        | Asset                                         | Kind  | Owner | Pri                  | Produced in                   | Needed by | Status   |
| --------- | --------------------------------------------- | ----- | ----- | -------------------- | ----------------------------- | --------- | -------- |
| **BR-01** | Brand guide                                   | Doc   | C     | P0                   | Phase 2                       | Phase 3   | drafted  |
| BR-02     | Wordmark master (after review, AG-9)          | Art   | B     | P0                   | Phase 2                       | Phase 4   | approved |
| BR-03     | Monogram mark (after review, AG-9)            | Art   | B     | P0                   | Phase 2                       | Phase 4   | approved |
| BR-04     | Favicon and app-icon set                      | Art   | C     | P1                   | Phase 8                       | Phase 8   | planned  |
| BR-05     | OG / social default image                     | Art   | B     | P1                   | Phase 8                       | Phase 8   | planned  |
| BR-06     | Résumé PDF                                    | Input | Y     | P1                   | Owner                         | Phase 4   | planned  |
| **TK-01** | Final palette tokens plus contrast tests      | Code  | C     | P0                   | Phase 3                       | Phase 4   | drafted  |
| TK-02     | Type tokens and font loading                  | Code  | C     | P0                   | Phase 3                       | Phase 4   | drafted  |
| TK-03     | Shape and elevation tokens                    | Code  | C     | P0                   | Phase 3                       | Phase 4   | drafted  |
| TK-04     | Layer palette and hatch mapping               | Code  | C     | P0                   | Phase 3                       | Phase 4   | drafted  |
| **CH-01** | Character bible                               | Doc   | B     | P0                   | Phase 2                       | Phase 2   | drafted  |
| CH-02     | Manifest schema (specification, in the bible) | Doc   | C     | P0                   | Phase 2                       | Phase 4   | drafted  |
| CH-03     | Pose `stack-stand`                            | Art   | Y     | P0                   | External, by the Phase 4 gate | Phase 4   | planned  |
| CH-04     | Pose `phone-show`                             | Art   | Y     | P0                   | External, by the Phase 4 gate | Phase 4   | planned  |
| CH-05     | Pose `peek`                                   | Art   | Y     | P0                   | External, by the Phase 4 gate | Phase 4   | planned  |
| CH-06     | Expressions: neutral, curious, pleased        | Art   | Y     | P0                   | External, by the Phase 4 gate | Phase 4   | planned  |
| CH-07     | Pose `point-callout`                          | Art   | Y     | P1                   | External                      | Phase 4   | planned  |
| CH-08     | Pose `pull-layer`                             | Art   | Y     | P1                   | External                      | Phase 5   | planned  |
| CH-09     | Pose `hand-off`                               | Art   | Y     | P1                   | External                      | Phase 4   | planned  |
| CH-10     | Teammate silhouette                           | Art   | Y     | P1                   | External                      | Phase 4   | planned  |
| CH-11     | Pose `off-duty`                               | Art   | Y     | P1                   | External                      | Phase 4   | planned  |
| CH-12     | Pose `wave-phone`                             | Art   | Y     | P1                   | External                      | Phase 4   | planned  |
| CH-13     | Expressions: focused, puzzled, surprised      | Art   | Y     | P1                   | External                      | Phase 5   | planned  |
| CH-14     | Raster exports (hero, peek)                   | Art   | C     | P1                   | Phase 8                       | Phase 8   | planned  |
| CH-15     | Sticker, README and email-signature avatars   | Art   | Y     | P2                   | Later                         | Later     | planned  |
| **IL-01** | Exploded stack master (5 planes)              | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-02     | Module blocks (3 variants)                    | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-03     | Callout kit                                   | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-04     | Title-block frame                             | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-05     | Isometric grid pattern                        | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-06     | Phone frame (generic)                         | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IL-07     | Six layer hatch patterns                      | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-08     | Commit-spine primitives                       | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-09     | Version-tag and release badges                | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-10     | Component specimen frames                     | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-11     | X-Ray overlay primitives                      | Art   | C     | P1                   | Phase 5                       | Phase 5   | planned  |
| IL-12     | Browser frame                                 | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-13     | Speech-chip style (3 variants)                | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IL-14     | Tablet frame                                  | Art   | C     | P2                   | Later                         | Later     | planned  |
| IL-15     | Decorative brick modules and dividers         | Art   | C     | P2                   | Later                         | Later     | planned  |
| IL-16     | Paper-grain texture                           | Art   | C     | P2                   | Later                         | Later     | planned  |
| **IC-01** | Core UI icons (8)                             | Art   | C     | P0                   | Phase 3                       | Phase 4   | planned  |
| IC-02     | Extended UI icons                             | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IC-03     | Social and contact glyphs                     | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| IC-04     | Indicators                                    | Art   | C     | P1                   | Phase 3                       | Phase 4   | planned  |
| **PR-01** | Project intake template plus NDA checklist    | Doc   | C     | P0                   | Phase 2                       | Phase 2   | drafted  |
| PR-02     | Screenshots (3 or more per project)           | Input | Y     | P1                   | Owner                         | Phase 4   | planned  |
| PR-03     | Recording (1 for the flagship)                | Input | Y     | P1                   | Owner                         | Phase 5   | planned  |
| PR-04     | Architecture diagram(s)                       | Art   | B     | P1                   | Phase 6                       | Phase 6   | planned  |
| PR-05     | X-Ray annotation data                         | Input | Y     | P1                   | Owner                         | Phase 5   | planned  |
| PR-06     | Before / after                                | Input | Y     | P2                   | Owner                         | Phase 6   | planned  |
| PR-07     | Case-study imagery                            | Art   | B     | P1 flagship, P2 rest | Phase 6                       | Phase 6   | planned  |
| PR-08     | Per-project OG images                         | Art   | C     | P2                   | Phase 8                       | Phase 8   | planned  |
| **AR-01** | Asset register (this document)                | Doc   | C     | P0                   | Phase 2                       | Phase 2   | drafted  |

Changes from the Revision 2 register: a Status column was added, and the "Produced in" wording for CH-03 to
CH-13 now reflects the D4 timing (art is delivered by the Phase 4 entry gate). Everything else is as in
Revision 2.

**D11 selection (2026-09-20):** BR-02 follows the **W-A** direction and BR-03 follows the **M-B**
direction. Production artwork was generated on 2026-09-20 and **approved by the owner under AG-9 on
2026-09-20, exactly in its drafted form**. Both rows are `approved`, not `wired`: no site UI uses them yet.
W-B, M-A and M-C are not being produced.

**Phase 3 (2026-09-20):** TK-01 to TK-04 are `drafted`: they exist in `packages/tokens/src` and are
generated into the web app, and they await the owner's review. They are not `approved` or `wired`.
IL-05 (isometric grid) and IL-06 (phone frame) stay `planned`: the CSS grid and device-frame primitives are
foundations, not those SVG assets.

## 13. Section dependency map

All main sections are built in Phase 4 (static). Interactions are Phase 5. Deep case studies are Phase 6.

| Section              | Required                                                                      | Optional                        | Blocked on                    |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------- | ----------------------------- |
| Shell / nav          | BR-02, IL-08, IC-01                                                           | BR-03                           | Production wordmark (BR-02)   |
| Hero                 | TK-01 to TK-04, CH-03, CH-06, IL-01, IL-02, IL-03, IL-04, IL-05, IC-01, IL-13 |                                 | Character art                 |
| Identity             | CH-04, IL-06, IL-04, IL-13                                                    | IC-04                           | Proof numbers, intro copy     |
| Layers               | IL-01, IL-07, IL-10, CH-07, CH-08, IL-03                                      |                                 | Skills the owner wants listed |
| Work                 | IL-06, IL-12, PR-02 (Phase 4); PR-03, PR-05, IL-11 (Phase 5)                  | CH-05 cameo, PR-06              | The owner's project material  |
| Release notes        | IL-08, IL-09, CH-09, CH-10                                                    | IC-04                           | Experience details            |
| Engineering thinking | IL-03, IL-04, PR-04 (Phase 6)                                                 | none (no character, on purpose) | Decision content              |
| About                | CH-11, IL-04                                                                  |                                 | About text, interests         |
| Contact              | CH-12, IC-03, IC-02, BR-06, IC-04                                             |                                 | Contact details               |
| Footer               | CH-05, BR-03, IC-03                                                           | IL-08 spine end                 |                               |

## 14. File register

One row per file, with the fields in section 5, added when a file is first accepted as `drafted`.

**Where the files are.** The four files were approved under AG-9 on 2026-09-20, exactly in their drafted
form, and were then copied into `docs/brand/source/`, which was created at that point (section 11). The
copies are byte-identical to the reviewed drafts (checksums in 14.3). They are untracked in git until the
owner commits them. Nothing has been wired into the site.

| id    | path                                                | kind | priority | producedIn | neededBy | sections    | status   | decorative | alt / longDescription           | source                                                     | licence                                     | owner                             | budgetKB                                         | acceptance                                                                                                                    |
| ----- | --------------------------------------------------- | ---- | -------- | ---------- | -------- | ----------- | -------- | ---------- | ------------------------------- | ---------------------------------------------------------- | ------------------------------------------- | --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| BR-02 | `docs/brand/source/br-02-wordmark-w-a.svg`          | Art  | P0       | Phase 2    | Phase 4  | Shell / nav | approved | `false`    | "Bhuvneshwar Rana"              | Script from Archivo, W-A parameters. See 14.1              | OFL 1.1 font. Artwork is the owner's (14.1) | Owner (approval), Claude (script) | Not defined (**NOT DECIDED**). 5.1 KB, 2.3 KB gz | 2026-09-20, Claude self-check, then owner approval (AG-9, 2026-09-20), A+B+F, with B7 flagged and clear space PROPOSED (14.2) |
| BR-02 | `docs/brand/source/br-02-wordmark-w-a-reversed.svg` | Art  | P0       | Phase 2    | Phase 4  | Shell / nav | approved | `false`    | "Bhuvneshwar Rana"              | As above. One-colour paper version for cobalt              | As above                                    | As above                          | As above. 5.1 KB, 2.3 KB gz                      | As above                                                                                                                      |
| BR-03 | `docs/brand/source/br-03-monogram-m-b.svg`          | Art  | P0       | Phase 2    | Phase 4  | Footer      | approved | `false`    | "Bhuvneshwar Rana monogram, BR" | Script from Archivo on the approved M-B geometry. See 14.1 | OFL 1.1 font. Artwork is the owner's (14.1) | Owner (approval), Claude (script) | Not defined (**NOT DECIDED**). 1.6 KB, 0.8 KB gz | 2026-09-20, Claude self-check, then owner approval (AG-9, 2026-09-20), A+B+F, with B7 flagged and clear space PROPOSED (14.2) |
| BR-03 | `docs/brand/source/br-03-monogram-m-b-reversed.svg` | Art  | P0       | Phase 2    | Phase 4  | Footer      | approved | `false`    | "Bhuvneshwar Rana monogram, BR" | As above. One-colour paper version for cobalt              | As above                                    | As above                          | As above. 1.4 KB, 0.7 KB gz                      | As above                                                                                                                      |

File naming: `br-<nn>-<description>.svg` uses the catalogue ID as the `<kind>-<nn>` part of the section 6
pattern. This convention is **APPROVED** (owner, 2026-09-20).

### 14.1 Provenance and licence (BR-02 and BR-03)

Recorded 2026-09-20. This is a reading of the published licence text and the SIL FAQ, not legal advice.

| Item                        | Finding                                                                                                                                                                                                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typeface                    | Archivo (variable), by Omnibus-Type. Font version 2.001                                                                                                                                                                                                                                                                                               |
| Source                      | Official Google Fonts repository, `google/fonts`, path `ofl/archivo/`, pinned at commit `95f4904f` (fetched 2026-09-20). Upstream repository in `METADATA.pb`: `Omnibus-Type/Archivo` at commit `b5d63988`                                                                                                                                            |
| File used                   | `Archivo[wdth,wght].ttf`, 658,596 bytes, git blob `cc64253d36665a5ca0d6719cdf1e32b3de453b51` (matches the GitHub API), SHA-256 `0e094a7d3c7c4c25cf1310c4b30014f1dae9332220b1c2c88f4fa996f0b05053`                                                                                                                                                     |
| Axes and instance           | `wght` 100 to 900, `wdth` 62 to 125. Instance used: **wdth 125, wght 800**. HarfBuzz shaping with kerning on, ligatures off                                                                                                                                                                                                                           |
| Licence                     | SIL Open Font License 1.1 (`OFL.txt`, `METADATA.pb` `license: "OFL"`, and name-table IDs 13 and 14 all agree)                                                                                                                                                                                                                                         |
| Copyright line              | "Copyright 2020 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo)"                                                                                                                                                                                                                                                                |
| Reserved Font Name          | **None declared.** The OFL.txt copyright line has no "with Reserved Font Name" clause, and neither `METADATA.pb` nor the font's name table lists one                                                                                                                                                                                                  |
| Trademark note              | Name-table ID 7 says "Archivo is a trademark of Omnibus-Type". The marks do not modify or redistribute the font, so OFL condition 3 (Reserved Font Names) and 4 (author names) are not engaged. Do not imply endorsement by the type designers                                                                                                        |
| Embedding flag              | OS/2 `fsType` 0 (installable, no restriction)                                                                                                                                                                                                                                                                                                         |
| Outline conversion (D2, F2) | **Confirmed.** SIL OFL FAQ 1.1 and 1.1.1 say fonts under the OFL may be used to create logos and other graphics from their outlines, with no extra licence, and that "you remain the author and copyright holder" of the derived graphic. The OFL conditions cover the Font Software itself, and the marks are artwork made with it, not a copy of it |
| Raw font in the repository  | **No.** The font file is not committed and is not a project dependency. It is kept outside the repository. Only the finished vector outlines are delivered                                                                                                                                                                                            |
| Tooling                     | Python 3.12 in an isolated virtual environment outside the repository: fontTools 4.65.0, uharfbuzz 0.56.1, shapely 2.1.2. Nothing was added to the project's dependencies                                                                                                                                                                             |
| Rendering for review        | sharp 0.35.4 (already in the workspace's `node_modules`, not modified) at 4x supersampling                                                                                                                                                                                                                                                            |
| Authorship of the drafts    | Generated by script written with Claude Sonnet 5 in Claude Code. **No AI image-generation tool was used.** M-B geometry is taken from the approved D11 review source                                                                                                                                                                                  |
| Review-board font copy      | The D11 review renders used a separate copy of Archivo whose provenance was not recorded. The production wordmark has the same overall width (2089.7 units at cap height 100), but production uses the pinned official file above                                                                                                                     |

### 14.2 Acceptance results (self-check, then owner approval under AG-9)

Run 2026-09-20 by Claude against the manual checklists in section 15. The owner then approved BR-02 and
BR-03 under AG-9 on 2026-09-20, exactly in their drafted form, with the acceptance decisions recorded in the
brand guide, section 5.7. The structural checks were re-run on the copies in `docs/brand/source/`: 48 of 48
pass.

| Check    | Result                                 | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1       | Pass                                   | Named per the approved `br-<nn>` convention (section 6). Delivered to `docs/brand/source/`, created at approval (section 11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| A2, A3   | Pass                                   | Rows above. Source and licence recorded (14.1). No AI image tool. Licence text and FAQ read on 2026-09-20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| A4 to A6 | Pass                                   | No third-party logos, no metadata, comments, or `<title>`, no secrets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| A7       | Pass, no budget                        | No brand-mark budget exists (**NOT DECIDED**). All four are far below the pose ceilings (60 KB, 20 KB gz, 400 paths): 1 to 6 paths each                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A8       | Pass                                   | No text baked in. `role="img"` and `aria-label` on each file. The alt text is in the register                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| A9, A10  | Pass                                   | Only approved palette values. Inputs are the owner-supplied name and initials. Contrast recomputed and equal to the brand guide figures                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A11      | Not applicable                         | Static art                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| A12      | Pass                                   | Status is `approved`. Reviewer: owner. Approval date: 2026-09-20 (AG-9)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| B1 to B6 | Pass                                   | Plain SVG 1.1, viewBox origin `0 0`, unique IDs, 1 decimal place, no transforms, none of the forbidden constructs, no `clipPath`. Strokes were expanded to filled paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| B5       | Pass, with a note                      | Fills carry palette classes (`p-ink`, `p-paper`, `p-cobalt`, `p-mint`, `p-butter`) **and** the approved hex as a presentation-attribute fallback, so the files also render standalone. A generator can remap the classes later                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| B7       | Not applicable, flagged                | The 1.5 px illustration outline and the layer-identity rule are for illustrations. The monogram keeps the approved D11 outline (2.6 units on a 100 unit mark). The cube faces use layer colours as pure colour, with no layer meaning. Whether checklist B applies to brand marks as written is **NOT DECIDED** (section 17). Owner decision 2026-09-20: keep this status, and do not force the 1.5 px rule onto the brand marks                                                                                                                                                                                                                                                                                                                                    |
| F1       | Pass                                   | The directions were chosen (D11), and the owner approved the production artwork under AG-9 on 2026-09-20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| F2       | Pass                                   | Outlines generated by script from the OFL typeface. Terms confirmed (14.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| F3       | Pass                                   | The name and initials were supplied by the owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| F4       | **Pass, against the revised minimums** | **Owner decision 2026-09-20.** Monogram BR-03: minimum usable size is **32 px**, and 16 px legibility is no longer required. Letters are clearly legible at **32 and 48 px** and at 96 px, so it **passes** at every size from 32 px up. Original observation, kept as history: at 16 px it reads as a cube and the letters are not reliably legible. Wordmark BR-02: minimum practical display width is **192 px** (capitals about 9 px tall), where the name reads clearly. The old 96 px observation (capitals about 4.6 px, name not readable) is **not** the minimum, so it is not a failure. No artwork was changed. The pass is against the revised criteria, not the original F4 wording. A 16 px variant is **DEFERRED / NOT DECIDED** and was not created |
| F5       | Pass, with a note                      | Checked on vellum, paper and cobalt (reversed one-colour version on cobalt, because ink on cobalt is 2.65 and fails). Clear space equals the cap height. It is not baked into the files (the viewBox is tight). For the monogram, cap height is read as the letter height, 25 units of 100. That reading stays **PROPOSED**. Owner decision 2026-09-20: it is not promoted to an approved rule                                                                                                                                                                                                                                                                                                                                                                      |
| F6       | Pass                                   | Approved palette only. No gradients or effects. Faces and edges lie on the 30 degree isometric axes. The same geometry as approved M-B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F7       | Pass                                   | Checklist B, as above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Fidelity to the approved M-B review source: the production render and the review render differ only along
edges (about 1.3% of pixels at 400 px, at most about 1 px wide), from 1-decimal rounding and baked transforms.

### 14.3 Approved file fingerprints (AG-9, 2026-09-20)

The files are approved exactly as fingerprinted. The copies in `docs/brand/source/` are byte-identical to the
reviewed drafts.

| File                                                | Bytes | SHA-256                                                            |
| --------------------------------------------------- | ----- | ------------------------------------------------------------------ |
| `docs/brand/source/br-02-wordmark-w-a.svg`          | 5172  | `5b9d6cb4c95847b651189fd302c564e1b1eb46a2a224e17df8bf28c7864b10ec` |
| `docs/brand/source/br-02-wordmark-w-a-reversed.svg` | 5174  | `e4734451f4fcdcb8ccaeee81fd9d36f1511cf27f3623370b9a1937ea96b8ebed` |
| `docs/brand/source/br-03-monogram-m-b.svg`          | 1588  | `9eb3bd4f5474b7cb343646ee64da08d3d6cc37c4a628a5d3009ee632a134c62d` |
| `docs/brand/source/br-03-monogram-m-b-reversed.svg` | 1418  | `5d2c78bbbd42edb1bfbd9aa47b174a5b86e3c5162dc4a170b4d06833e97afbb6` |

## 15. Manual acceptance checklists (AG-2: no script)

Complete every applicable checklist for each file. A file is `approved` only when every applicable line
passes and the owner accepts it.

### A. Every asset file

| #   | Check                                                                                                                                                        | Pass |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| A1  | Named per section 6 and placed in the agreed folder                                                                                                          | ☐    |
| A2  | A register row exists with every field in section 5 filled in                                                                                                | ☐    |
| A3  | `source` and `licence` are recorded, including any AI tool and version. The licence gives the owner commercial use and edit rights, **confirmed before use** | ☐    |
| A4  | No third-party logos, trademarks or manufacturer likeness                                                                                                    | ☐    |
| A5  | No personal data the owner did not choose to publish (image metadata, real names, emails, account identifiers)                                               | ☐    |
| A6  | No secrets or credentials visible                                                                                                                            | ☐    |
| A7  | Within the size budget in section 8                                                                                                                          | ☐    |
| A8  | `decorative`, or `alt` or `longDescription`, is set. No text is baked into the asset                                                                         | ☐    |
| A9  | Colours come from the approved palette, and text pairs follow the contrast rules in the brand guide                                                          | ☐    |
| A10 | Nothing is invented: every fact or claim traces to owner input                                                                                               | ☐    |
| A11 | If animated, a static fully assembled state exists for reduced motion                                                                                        | ☐    |
| A12 | The status, reviewer and date are recorded                                                                                                                   | ☐    |

### B. SVG assets (PROPOSED constraints, from the Revision 2 SVG contract)

| #   | Check                                                                                                           | Pass |
| --- | --------------------------------------------------------------------------------------------------------------- | ---- |
| B1  | Plain SVG 1.1 with a viewBox whose origin is `0 0`                                                              | ☐    |
| B2  | None of: `<style>`, `<image>`, filters, masks, `<foreignObject>`, scripts, text, external references, gradients | ☐    |
| B3  | No `clipPath` (keeps `react-native-svg` compatibility). Any exception needs the owner's approval                | ☐    |
| B4  | IDs are unique and stable                                                                                       | ☐    |
| B5  | Fills use palette classes or `currentColor`                                                                     | ☐    |
| B6  | Coordinates have 1 decimal place. No transforms are baked onto groups meant to animate                          | ☐    |
| B7  | Illustration shapes carry the 1.5 px `ink` outline and follow the layer-identity rule (number, label, hatch)    | ☐    |

### C. Icons (PROPOSED)

| #   | Check                                                                                         | Pass |
| --- | --------------------------------------------------------------------------------------------- | ---- |
| C1  | 24×24 grid, 1.5 px stroke, butt caps, mitre joins                                             | ☐    |
| C2  | Angles are 90°, 45° or 30° only                                                               | ☐    |
| C3  | Uses `currentColor`. Fills appear only in indicator dots                                      | ☐    |
| C4  | Legible at 20 px. The name follows `icon-<name>.svg`                                          | ☐    |
| C5  | It is the owner's own glyph, not a recoloured official logo (D7). Social icons pair with text | ☐    |

### D. Screenshots and raster images

| #   | Check                                                                                                | Pass |
| --- | ---------------------------------------------------------------------------------------------------- | ---- |
| D1  | Delivered as AVIF and WebP at the widths in section 7, with the correct aspect ratio, never upscaled | ☐    |
| D2  | Device-native capture, clean status bar, light mode                                                  | ☐    |
| D3  | Data is sanitised. No real user data, credentials, tokens or private URLs                            | ☐    |
| D4  | Metadata is stripped                                                                                 | ☐    |
| D5  | The owner confirms rights to the image, and clearance is recorded (checklist H)                      | ☐    |
| D6  | Alt text is authored                                                                                 | ☐    |

### E. Video

| #   | Check                                                                                           | Pass |
| --- | ----------------------------------------------------------------------------------------------- | ---- |
| E1  | 8 to 30 seconds, portrait, silent (no audio track)                                              | ☐    |
| E2  | MP4 and WebM, 720×1560, 30 fps, 3 MB or less each, plus a poster image                          | ☐    |
| E3  | Sanitised content (same rules as D3). Clearance recorded                                        | ☐    |
| E4  | A description is written. A pause control is planned. It does not autoplay under reduced motion | ☐    |

### F. Brand marks (wordmark and monogram)

| #   | Check                                                                                                                                                                               | Pass |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| F1  | The owner chose the direction after the visual review board (D11: W-A and M-B), and approval of the production artwork (AG-9) is recorded. **The artwork is not final before that** | ☐    |
| F2  | Wordmark outlines were generated by script from the OFL typeface (D2), with the OFL terms for outlines confirmed                                                                    | ☐    |
| F3  | The display form of the name (and initials, if used) was supplied by the owner                                                                                                      | ☐    |
| F4  | The monogram is legible at 32 and 48 px and is not used below 32 px. The wordmark is displayed at least 192 px wide (owner decision 2026-09-20, replaces 16 px and 96 px)           | ☐    |
| F5  | Checked on vellum, paper and cobalt. Clear space equals the cap height                                                                                                              | ☐    |
| F6  | Only approved palette colours. No gradients or effects. Not tilted off the isometric axes                                                                                           | ☐    |
| F7  | Checklist B passes                                                                                                                                                                  | ☐    |

### G. Character artwork

Use the 15-check acceptance checklist in [character-bible.md](character-bible.md), section 12, together with
checklist A. It is not repeated here.

### H. Project material and clearance

| #   | Check                                                                                     | Pass |
| --- | ----------------------------------------------------------------------------------------- | ---- |
| H1  | Clearance is recorded in the project intake (public, NDA-abstracted, or not publishable)  | ☐    |
| H2  | The owner confirms they own or may use every image, and the employer or client permits it | ☐    |
| H3  | Every metric has a source, a method and a date                                            | ☐    |
| H4  | The `NDA-abstracted` badge is used only where it is true                                  | ☐    |
| H5  | Nothing was invented. Unknowns remain INPUT REQUIRED                                      | ☐    |

### I. Documents (résumé PDF)

| #   | Check                                                                     | Pass |
| --- | ------------------------------------------------------------------------- | ---- |
| I1  | Personal metadata is stripped                                             | ☐    |
| I2  | The file name is descriptive                                              | ☐    |
| I3  | The content matches the published content data, and the owner approved it | ☐    |

### J. Phase gates

| #   | Gate                                                                                                                                                                                                                       | Pass |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| J1  | **Phase 3 entry:** D3 and D5 to D10 are recorded, the brand guide is approved by the owner, this register exists                                                                                                           | ☐    |
| J2  | **Phase 3 start:** AG-3, AG-4 and AG-5 are asked and answered before the work they cover. AG-5 was exercised by the owner's Phase 3 instruction (2026-09-20). AG-3 and AG-4 are open and undefined, so this stays unticked | ☐    |
| J3  | **Phase 4 entry:** every P0 row in section 12 is `approved`, including the character art (CH-03 to CH-06) and the wordmark and monogram (BR-02, BR-03)                                                                     | ☐    |
| J4  | **Phase 4 entry:** the "before Phase 4" items in the content checklist are supplied, and AG-1 is addressed                                                                                                                 | ☐    |

## 16. Recording results (PROPOSED)

When a file passes, add a line to its register row `acceptance` field: the date, the reviewer, and the
checklists that passed (for example `2026-09-19, owner, A+B+F`). Where completed checklists are stored beyond
that is **NOT DECIDED**.

## 17. Not decided and INPUT REQUIRED

| Item                                                                                            | Status                                                                          |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Whether the register is later converted to JSON                                                 | **NOT DECIDED**                                                                 |
| Where completed checklists are stored, beyond the register `acceptance` field                   | **NOT DECIDED**                                                                 |
| Whether the SVG constraints in checklist B apply to non-character SVG assets exactly as written | **NOT DECIDED**                                                                 |
| Size budgets for assets not listed in section 8                                                 | **NOT DECIDED**                                                                 |
| Display form of the name and initials                                                           | Supplied by the owner (Bhuvneshwar Rana, BR)                                    |
| A dedicated 16 px favicon or tiny-size monogram variant                                         | **DEFERRED / NOT DECIDED**: not created unless the owner explicitly requests it |
| The owner's project material, résumé and contact details                                        | **INPUT REQUIRED** (see the content checklist)                                  |

## 18. Change log

| Date       | Change                                                                                                                                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-19 | Initial Asset Register Specification (AR-01), with manual acceptance checklists                                                                                                                                                                                                                                            |
| 2026-09-20 | BR-02 and BR-03 set to `drafted` (files held outside the repo). Sections 14, 14.1 and 14.2 added: file rows, Archivo provenance and licence, self-check results. Nothing approved, AG-9 pending                                                                                                                            |
| 2026-09-20 | Owner decisions recorded: F4 revised (monogram minimum 32 px, wordmark minimum 192 px) and now passes against them, 16 px variant deferred, B7 and clear space unchanged, `br-<nn>` naming approved. Nothing approved, AG-9 pending                                                                                        |
| 2026-09-20 | AG-9 approved by the owner. BR-02 and BR-03 set to `approved` (not `wired`). The four SVGs were copied unchanged into `docs/brand/source/`. Paths, acceptance and checksums recorded (sections 14, 14.2, 14.3). B7 stays NOT DECIDED / flagged, clear space stays PROPOSED, the 16 px variant stays DEFERRED / NOT DECIDED |
| 2026-09-20 | TK-01 to TK-04 set to `drafted` (Phase 3 foundation, awaiting review). No asset was approved or wired                                                                                                                                                                                                                      |
| 2026-09-20 | Gate J2 annotated: AG-5 exercised by the owner's Phase 3 instruction, AG-3 and AG-4 open and undefined. Checkbox left unticked                                                                                                                                                                                             |
