# Character Bible (CH-01)

- **Status:** specification only. **No character artwork exists or is created by this document.**
- **Date:** 2026-09-19
- **Source:** Phase 2 Specification Revision 2 (section 3), and the approval record in
  [brand-guide.md](brand-guide.md).
- **Purpose:** to brief the AI-assisted concept and human vectorisation work (D4, Option C) and to define
  what will be accepted at the Phase 4 entry gate.
- **Rule:** any personal appearance detail that is not explicitly known is marked **INPUT REQUIRED**. Nothing
  about the owner's appearance is inferred or invented in this document.

## 1. How to read this document

| Marker             | Meaning                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| **CONFIRMED**      | Decided in the project context or recorded in the approval record                    |
| **PROPOSED**       | A production rule from Revision 2. It applies as the working contract unless changed |
| **INPUT REQUIRED** | Information only the owner can supply. It is not guessed                             |
| **NOT DECIDED**    | An open question that this document flags and does not answer                        |

## 2. Confirmed decisions

| Item              | Confirmed                                                                                                                                          | Source                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Style             | Flat layered vector with cut-paper depth                                                                                                           | Project context        |
| Personality       | Calm, curious, competent                                                                                                                           | Project context        |
| Held object       | A phone in hand                                                                                                                                    | Project context        |
| Pose count        | About 8 useful poses                                                                                                                               | Project context        |
| Speech            | Shown as notification-style chips                                                                                                                  | Project context        |
| Animation         | The character is animation-ready and can separate into layers (the assemble / explode language)                                                    | Project context        |
| Production route  | **D4 Option C:** AI-assisted concept, followed by human vectorisation                                                                              | Approval record        |
| Timing            | **Deferred to the Phase 4 entry gate.** Hero implementation is blocked until character art is delivered and accepted. Phase 3 proceeds in parallel | Approval record        |
| Final art now     | **None.** No final character art is created in this pass                                                                                           | Approval record        |
| Licence           | Must give the owner commercial use and edit rights, and **must be confirmed before use**                                                           | Approval record        |
| Palette           | The approved working palette, with its contrast and accessibility rules                                                                            | Approval record (D3)   |
| Layer IDs         | `interface`, `components`, `state`, `native`, `delivery`, `leadership` (frozen)                                                                    | Approval record (D10)  |
| `packages/avatar` | Not created now. Considered at the start of Phase 4, only when justified by the implementation need (AG-1, option b)                               | Approval record        |
| Interim location  | Character art, when it exists, lives in `docs/brand/source/character/`. That folder does not exist yet                                             | Approval record (AG-1) |
| Acceptance method | A **manual checklist** (section 12). There is no `check-assets` script                                                                             | Approval record (AG-2) |
| Priority meaning  | P0 means required before Hero implementation in Phase 4                                                                                            | Approval record (D12)  |

## 3. Production route: D4 Option C

**Route:** AI-assisted concept, followed by human vectorisation. **Timing:** Phase 4 entry gate.

### 3.1 Constraints carried from Revision 2

- **Fully AI-generated art auto-traced to vector will not meet the layered-SVG contract** in section 9. The
  human vectorisation step is required, and it produces the deliverable.
- The licence must give the owner commercial use and edit rights. Output licensing of AI tools is uncertain
  and **must be confirmed before use**.
- Raw originals, including AI concept images and reference photos, **stay out of git**. Only accepted,
  optimised deliverables are committed.

### 3.2 Proposed production stages

| Stage | What happens                                                        | Output                             |
| ----- | ------------------------------------------------------------------- | ---------------------------------- |
| 1     | AI-assisted concept exploration against this bible                  | Concept references (not committed) |
| 2     | The owner selects a direction                                       | A recorded choice                  |
| 3     | A human builds the layered vector art to the contract in section 9  | Pose SVGs and expression fragments |
| 4     | Acceptance against the manual checklist in section 12               | An accepted or rejected verdict    |
| 5     | Accepted files are registered with `source` and `licence` filled in | Asset register rows                |

### 3.3 Provenance to record for every delivered file

Which tools were used (including any AI tool and version), who performed the human vectorisation, the
licence terms that apply, and the date. These go in the asset register `source`, `licence` and `owner` fields.

## 4. Character definition

### 4.1 Personality and role

Calm, curious, competent (**CONFIRMED**). The character is the recurring narrator of the portfolio. Its
speech is shown as notification-style chips. The chip style is produced in Phase 3 (IL-13). **Chip text is
real HTML, never part of the character SVG.**

### 4.2 Proportions and style (PROPOSED)

| Aspect    | Specification                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Height    | About 5 heads tall, head about 20% of total height                                                                |
| Shapes    | Simple geometric torso and limbs                                                                                  |
| Hands     | Mitten-style, clearly able to hold a phone                                                                        |
| Fills     | Flat only. No gradients                                                                                           |
| Depth     | Cut-paper: an offset paper shadow per major part. Offset value is **NOT DECIDED** and is set after concept review |
| Outlines  | `ink`, with **strokes expanded to filled paths** so scaling stays consistent                                      |
| Tolerance | The vectoriser may deviate from proportions by up to 10% with approval                                            |

### 4.3 The phone (CONFIRMED that it is always held)

The phone is generic. It has **no manufacturer likeness or branding** and shows a plain generic screen, not a
real or fake app.

### 4.4 Colour rules (PROPOSED)

- Fills come from the approved palette classes (`p-ink`, `p-paper`, `p-cobalt` and so on).
- Clothing uses at most 3 flat palette colours, and no logos or readable text.
- The `ink` outline rule and the contrast rules in the approval record apply.
- **NOT DECIDED:** how skin and hair colours are represented. They are not in the approved palette. Adding
  colours to `@assembly/tokens` would need the AG-5 gate. This must be resolved before the art is accepted.

### 4.5 Other people

Any teammate figure is a **generic silhouette with no likeness of a real person**.

## 5. Appearance and likeness (all INPUT REQUIRED)

Nothing here is known, and nothing is inferred from the owner's name, photos or account details.

| Field                                                   | Status             |
| ------------------------------------------------------- | ------------------ |
| Skin tone                                               | **INPUT REQUIRED** |
| Hair (colour, length, style)                            | **INPUT REQUIRED** |
| Facial features to reflect                              | **INPUT REQUIRED** |
| Glasses or facial hair                                  | **INPUT REQUIRED** |
| One silhouette feature drawn from the owner's real look | **INPUT REQUIRED** |
| Signature colour                                        | **INPUT REQUIRED** |
| Clothing                                                | **INPUT REQUIRED** |
| Reference photos (private, not committed)               | **INPUT REQUIRED** |

The three recognisable traits are the silhouette feature above, the phone (**CONFIRMED**), and the signature
colour.

## 6. Canvas and parts (PROPOSED)

### 6.1 Canvas

- Every pose uses **viewBox `0 0 1200 1600`**.
- Feet baseline at y = 1500. Top of the head near y = 100.
- The top 260 units are padding for explode offsets.
- **One head orientation (three-quarter front) in every pose**, so face parts are shared.

### 6.2 Parts, back to front

Each part is its own `<g id="part-…">`:

`shadow`, `back-arm`, `legs`, `torso`, `clothing`, `neck`, `head-base`, `hair-back`, `ears`, `face-slot`,
`hair-front`, `accessory`, `front-arm`, `hand`, `phone` (plain generic screen), `foreground-shadow`.

### 6.3 Expressions are swappable fragments

Each pose carries a neutral face in `face-slot`. Expression fragments (`eyes-*`, `brows-*`, `mouth-*`) are
defined once around a face origin. The manifest gives each pose a `faceAnchor` (x, y, rotation, scale).

## 7. Pose inventory (8, PROPOSED)

| ID              | Pose                                              | Used in                    | Register | Priority | Needed by |
| --------------- | ------------------------------------------------- | -------------------------- | -------- | -------- | --------- |
| `stack-stand`   | Standing on or leaning against the exploded stack | Hero                       | CH-03    | P0       | Phase 4   |
| `phone-show`    | Holding up a phone with a generic screen          | Identity                   | CH-04    | P0       | Phase 4   |
| `peek`          | Head and shoulders over an edge                   | Footer, 404, scroll marker | CH-05    | P0       | Phase 4   |
| `point-callout` | Pointing at a callout                             | Layers                     | CH-07    | P1       | Phase 4   |
| `pull-layer`    | Pulling a plane out of the stack                  | Layers (interaction)       | CH-08    | P1       | Phase 5   |
| `hand-off`      | Handing a module block to a teammate silhouette   | Release notes              | CH-09    | P1       | Phase 4   |
| `off-duty`      | Relaxed, casual                                   | About                      | CH-11    | P1       | Phase 4   |
| `wave-phone`    | Waving with the phone                             | Contact                    | CH-12    | P1       | Phase 4   |

Related assets: **CH-10** teammate silhouette (P1, Phase 4). The `peek` head mark is also the basis of the
M-C monogram direction, which is **not carried** to the review board until final art exists (D11).

**Where the character does not appear:** the Engineering thinking section has no character, on purpose.

## 8. Expression inventory (6, PROPOSED)

| Set      | Expressions                       | Register | Priority | Needed by |
| -------- | --------------------------------- | -------- | -------- | --------- |
| Core     | `neutral`, `curious`, `pleased`   | CH-06    | P0       | Phase 4   |
| Extended | `focused`, `puzzled`, `surprised` | CH-13    | P1       | Phase 5   |

## 9. Layered SVG contract (PROPOSED, the acceptance contract)

Every pose file, and every expression fragment, must satisfy all of these.

| Rule        | Requirement                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| IDs         | Unique and stable: `part-*` for parts, `pivot-*` for pivots                                                         |
| Coordinates | Flat, with **no transforms baked onto groups**. The assembled state is the file's default                           |
| Forbidden   | `<style>`, `<image>`, filters, masks, `<foreignObject>`, scripts, **text**, external references, gradients          |
| Clipping    | No `clipPath` (keeps `react-native-svg` compatibility)                                                              |
| Fills       | Palette classes only (`p-ink`, `p-cobalt`, …). Mapped to token colours by a generator in a later phase              |
| Size budget | **60 KB raw, 20 KB gzip or less** per pose                                                                          |
| Complexity  | **400 paths or fewer** per pose                                                                                     |
| Precision   | 1 decimal place                                                                                                     |
| Format      | Plain SVG 1.1, viewBox origin `0 0`                                                                                 |
| Names       | kebab-case, ASCII. Poses `pose-<id>.svg`, expressions `expr-<name>.svg`, parts `part-<name>`, pivots `pivot-<name>` |

## 10. Pivots, explode offsets, animation readiness (PROPOSED)

### 10.1 Pivots

| Pivot                                                      | Drives                        |
| ---------------------------------------------------------- | ----------------------------- |
| `pivot-neck`                                               | Head tilt and look-at (±4°)   |
| `pivot-torso-base`                                         | Breathing (subtle scale)      |
| `pivot-eyelid`                                             | Blink                         |
| `pivot-pupil`                                              | Cursor look-at (small offset) |
| `pivot-shoulder-l/r`, `pivot-elbow-l/r`, `pivot-wrist-l/r` | Wave, phone tilt, pull        |

### 10.2 Explode offsets

- Parts are grouped into planes: **shadow, body, clothing, face, held object**.
- They separate **along the screen vertical**, in steps of **48 units, up to 240**.
- The vectoriser supplies the values, and they must stay inside the viewBox.
- Explode is decorative. **No meaning may depend on the exploded state.**

### 10.3 Animation-ready means

- Every animated part is its own group.
- Every pivot is defined in the manifest.
- The assembled state is the file's default.
- No static pose depends on script.
- Reduced motion shows the static, fully assembled state.

## 11. Manifest schema (specification only)

The manifest is pure data. It contains no React, DOM or Node. It lives as `manifest.json` beside the art in
`docs/brand/source/character/` until AG-1 is decided. It is **not created now**.

| Field           | Content                                                |
| --------------- | ------------------------------------------------------ |
| `id`            | The pose ID from section 7                             |
| `file`          | The SVG filename                                       |
| `viewBox`       | `0 0 1200 1600`                                        |
| `parts[]`       | Part IDs with z-order                                  |
| `pivots{}`      | Pivot ID to `{x, y}` in viewBox units                  |
| `faceAnchor`    | `{x, y, rotation, scale}` for the `face-slot`          |
| `explode{}`     | Part to `{dx, dy, order}`                              |
| `expressions[]` | Expression fragments this pose supports                |
| `usedIn[]`      | Sections that use the pose                             |
| `decorative`    | `true` by default                                      |
| `alt`           | Accessible text, **only** for the rare informative use |

## 12. Acceptance checklist (manual, per AG-2)

Complete this for each delivered file. There is no script.

| #   | Check                                                                                                       | Pass |
| --- | ----------------------------------------------------------------------------------------------------------- | ---- |
| 1   | The file opens as plain SVG, viewBox `0 0 1200 1600` (pose) with origin `0 0`                               | ☐    |
| 2   | No forbidden construct from section 9 is present (search the file for each)                                 | ☐    |
| 3   | Every part in section 6.2 exists as `<g id="part-…">`, in the specified back-to-front order                 | ☐    |
| 4   | All IDs are unique and follow the naming convention                                                         | ☐    |
| 5   | All pivots from section 10.1 that the pose uses are defined, and lie inside the viewBox                     | ☐    |
| 6   | Explode offsets are supplied for every part group and keep every part inside the viewBox                    | ☐    |
| 7   | Fills use palette classes only, and text or contrast rules from the approval record are respected           | ☐    |
| 8   | Strokes are expanded to filled paths                                                                        | ☐    |
| 9   | Size is 60 KB raw and 20 KB gzip or less, with 400 paths or fewer                                           | ☐    |
| 10  | No text, logos or manufacturer likeness appear anywhere, including on the phone screen                      | ☐    |
| 11  | Head orientation matches the shared three-quarter front, and `faceAnchor` is defined                        | ☐    |
| 12  | Expression fragments for the pose's set (section 8) exist and swap cleanly at the `faceAnchor`              | ☐    |
| 13  | Provenance is recorded: tools (including any AI tool), human vectoriser, licence terms, date                | ☐    |
| 14  | The licence gives the owner commercial use and edit rights, **confirmed before use**                        | ☐    |
| 15  | The asset register row is complete, with `decorative` or `alt`, `source`, `licence`, `owner` and `budgetKB` | ☐    |

### 12.1 Phase 4 entry gate for the character

Hero implementation may begin when **CH-03, CH-04, CH-05 and CH-06** (`stack-stand`, `phone-show`, `peek` and the
core expressions) pass every check above. The other poses are needed during Phase 4 (CH-07, CH-09, CH-10,
CH-11, CH-12) and Phase 5 (CH-08, CH-13), as listed in section 7.

## 13. Accessibility rules for the character

- The character is **decorative by default** (`aria-hidden`). `alt` is used only for a rare informative use.
- **No text lives inside the SVG.** Speech and labels are HTML.
- No meaning depends on colour alone, or on the exploded state.
- Callouts never cover the character's face.
- Every animated behaviour has a static, fully assembled fallback for reduced motion.

## 14. Source and export formats (PROPOSED)

| Kind             | Format                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Source           | A Figma, Illustrator or Affinity file **owned by the owner and stored outside git**, with a link in this guide |
| Delivered        | Plain SVG 1.1, one per pose, plus expression fragments                                                         |
| Raster fallbacks | WebP and PNG at 1x and 2x, only for the OG image and hero fallback. Produced in Phase 8 (CH-14)                |

Source file link: **INPUT REQUIRED** (none exists yet).

## 15. Remaining inputs (INPUT REQUIRED)

| Needed for         | Item                                                                                                     | When needed                       |
| ------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Appearance         | Skin tone, hair, facial features, glasses or facial hair, silhouette feature, signature colour, clothing | Before concept exploration begins |
| Likeness reference | Reference photos (private, not committed)                                                                | Before concept exploration begins |
| Route logistics    | Which AI tool(s) will be used, and who performs the human vectorisation                                  | Before concept exploration begins |
| Licence            | The licence terms for each tool and for the vectoriser, confirmed before use                             | Before any use                    |
| Source file        | The location of the owner's source file (outside git)                                                    | When art is produced              |

Per D4, the art is deferred to the **Phase 4 entry gate**: it must be delivered and accepted by then. When
concept exploration starts is **not decided** (see section 16). The items above are needed before it starts.

## 16. Not decided (flagged, not answered here)

1. **Skin and hair colours.** They are not in the approved palette, and how to represent them is not decided.
   Adding colours to tokens needs AG-5.
2. **Cut-paper offset value.** The offset of the paper shadow per part is not decided.
3. **Sharing reference photos with an AI tool.** Whether the owner's photos may be given to an AI tool is not
   decided. This must be confirmed before any upload.
4. **The human vectoriser.** Who performs the vectorisation is not decided.
5. **Start of concept exploration.** D4 defers the art to the Phase 4 entry gate. When exploration begins
   (for example during Phase 3, or later) is not decided.

## 17. Change log

| Date       | Change                                                          |
| ---------- | --------------------------------------------------------------- |
| 2026-09-19 | Initial Character Bible (CH-01). Specification only, no artwork |
