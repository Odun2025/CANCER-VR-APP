# CancerCompass VR — Implementation Plan

Source: PRD.md — CancerCompass VR Immersive Cancer Support & Wellbeing Experience
Owner: CancerCompass and Med Crescent Pharmacy

> Central question: “What do you need right now?”
> Positioning: a cancer journey companion that happens to use VR — not just a VR app.

## 0. Chosen Stack (MVP — LOCAL ONLY)

**Explicit: APP AND DB RUN LOCALLY FOR NOW. No cloud. No server. Works offline in hospital/home.**

- **App Framework:** Unity 2022 LTS + OpenXR + XR Interaction Toolkit (C#)
  - Runs locally on: Meta Quest (standalone) + Windows PC for testing
  - All MVP logic on-device: check-in → need → recommendation → player → post check-in
  - Content driven by local JSON files in `StreamingAssets/` so non-developers can edit copy/audio lists without code changes
- **Database:** SQLite (local file) via `Application.persistentDataPath`
  - Runs locally on-device, single file `cancercompass.db`
  - Stores only: local profile nickname, check-ins, chosen needs, favourites (place/sound/length), feedback (Yes/A little/Not really/No), journey stage
  - No PII, no cloud sync in MVP. Wipe-data button included.
  - Fallback: JSON files if SQLite plugin unavailable — still local.
- **Authentication:** None (local profiles) for MVP
  - No login, no passwords, no cloud accounts
  - Patient picks a local profile on-device (e.g. “Ada”). Caregiver picks separate local profile.
  - Reason: privacy, hospital offline use, low friction for tired patients. Cloud auth (e.g. Supabase Auth / Firebase Auth) deferred to post-pilot.
- **File Storage:** Local on-device storage only
  - Worlds/scenes bundled in build; audio/video in `StreamingAssets/`; user notes in `persistentDataPath`
  - No S3 / Firebase Storage / cloud bucket in MVP
  - Target: <2GB install, runs fully offline after install

Future (post-pilot, NOT now): optional cloud sync — Supabase (Postgres + Auth + Storage) or Firebase — for caregiver sharing + analytics. MVP stays local.

---

## Phase 0 — Foundations & Guardrails
PRD refs: Sec 22 Safety, 23 Content, 24 Menu, 28 Success.
Goal: Lock safety + flow before building worlds.

Concrete outputs:
- Repo structure: `/Assets/App /Assets/Worlds /Assets/Audio /StreamingAssets/content /Docs`
- UX flow map: Open → Check-in → Need → Recommendation → Experience → Post check-in → Continue
- Safety copy deck (local JSON): general-info vs personal-advice banners, “discuss with your team” strings, I-Need-Help list (caregiver/nurse/doctor/pharmacist/emergency)
- Content checklist enforced in reviews: compassionate, simple, hopeful-but-realistic, culturally relevant, stop/change/skip anytime
- Analytics spec (local only): completion, “Did this help?”, return-to, reuse intent. No network calls.

Done when: Ada story traceable screen-by-screen on paper.

## Phase 1 — Core Loop Skeleton (MVP backbone)
PRD refs: Feature 1 Check-In, Feature 2 Need, Feature 14 Help, Feature 15 Feedback.
Goal: Signature loop works before fancy graphics.

Concrete outputs:
- `Home.unity` + `CheckInPanel.prefab`: 11 emotions + I’m not sure. No wrong-emotion design.
- `NeedPanel.prefab`: 6 needs — peaceful / relax / distract / understand / encourage / connect
- `Recommender.cs` (rule-based v1, local): Anxious→Relax/Prepare, Tired→short relax, Confused→Understand. Patient always overrides.
- `HelpButton.prefab` persistent + `FeedbackPanel.prefab` (Yes/A little/Not really/No → What next?)
- `ExperiencePlayer.cs` placeholder (plays local audio or loads dummy scene)
- Local DB tables: `checkins`, `feedbacks`

Done when: Full loop completable in <2 min seated, 1 hand/gaze.

## Phase 2 — Treatment Mode + Escape Worlds v1
PRD refs: Feature 3 Worlds, Feature 5 Treatment Mode.
Goal: Differentiator “I’m in Treatment Now.”

Concrete outputs:
- `TreatmentMode.unity`: 5 doors — Somewhere / Relax / Distract / Understand / Connected. Switchable mid-session.
- 4 worlds only: `NG_Coast.unity` (Nigerian coastal — differentiator), `Garden.unity`, `SunsetBeach.unity`, `CalmFantasy.unity`
- Each world: wellbeing purpose tag (local JSON), 3–5 min loop, calm local audio, comfort mode (no forced motion, vignette, seated)
- `SessionManager.cs`: resume after headset remove; all state in local SQLite

Done when: Ada can do Prepare → Coast → switch to Distract mid-session without restart, offline.

## Phase 3 — Relaxation Library + Simple Education
PRD refs: Feature 4 Relaxation, Feature 6 Education.
Goal: Complete MVP: relax + understand.

Concrete outputs:
- `/StreamingAssets/audio/` v1 (5 local files): breathing 3m, grounding 5m, body relax 7m, sleep prep 8m, encouragement 2m
- `/StreamingAssets/education.json` v1 (6 topics): what is cancer, what is chemo, side effects, medication safety, when to seek care, questions to ask team. Each <90s plain language + “general info only” banner, pharmacist-reviewed flag
- `EducationPanel.prefab`: education inside world (e.g. garden), not textbook page
- All files local, no streaming

Done when: Confused patient gets answer + team prompt, no diagnosis given.

## Phase 4 — Prepare / After / Home / Journey-lite
PRD refs: Feature 7 Prepare, 8 Post-treatment, 9 Home, 12 Journey.
Goal: Companion beyond chemo chair.

Concrete outputs:
- `PrepareMode.unity`: what to expect + questions list + calming + encouragement (local JSON)
- Post-treatment panel: Comfortable/Tired/Worried/Uncomfortable/Emotional/Relieved/Unsure → tailored next + red-flag reminder to contact team
- Home mode flag in DB: same loop, short sessions, sleep support
- `JourneyPanel.prefab`: Diagnosis→Preparing→Treatment→Recovery→Home→Follow-up, non-linear, no failure language. Stored locally.

Done when: Ada full run works: Anxious→Prepare→Coast→Treatment Distract→Tired→Relax, offline.

## Phase 5 — Caregiver + Connect + Personalization v1
PRD refs: Feature 10 Caregiver, 11 Connection, 13 Personalization.
Goal: Post-MVP ecosystem, still local.

Concrete outputs:
- Separate caregiver entry (local profile): “How can I support them?” 7 guides + self-care + when to seek help. No access to patient DB without explicit on-device share toggle.
- Connect v1 (local only): pre-loaded encouragement + family audio notes recorded on-device (no cloud, no outcome promises)
- Favourites v1 in SQLite: favourite place/sound/length short-long, “You usually choose peaceful nature…” suggestion. Local only, privacy-respecting.

Done when: Caregiver can use app alone on same device without seeing patient data unless shared.

## Phase 6 — Hospital Pilot Hardening
PRD refs: Sec 22, 28, 29.
Goal: Safe to test with real patients, still offline.

Concrete outputs:
- Comfort pass: seated, stop/exit <2s, cybersickness checklist, offline installer (APK/build on USB)
- Consent + confidentiality flow (on-device), wipe-data, no PII export
- Pilot kit in `/Docs`: 10-patient protocol measuring PRD Sec 28 — completion, anxiety self-report, usefulness, reuse intent. Satisfaction separated from clinical efficacy claims.
- Export for analysis: manual CSV export from local SQLite via USB (no auto-upload)

Build order: 0 → 1 → 2 → 3 = MVP launchable offline. 4 → 5 → 6 = pilot + expansion.

All app code, database, auth (local profiles), and files run locally on-device for now. Cloud sync deferred.
