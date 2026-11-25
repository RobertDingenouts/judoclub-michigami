# Punchlist uit audit 2026-11 — gefaseerd

**Totaal 2119 bevindingen; fase A is al geregistreerd in deze branch. Rest: 111 security · 972 bugs · 1036 overig.**

## Fase A — gedaan (zie eerdere commits op deze branch)
11 migrate-routes, diploma-IDOR, exams/pending+generate, rate-limits (login/forgot/password), hashes uit browser-reacties, server-actions gecheckt, backuprechten, PII-log sync.

## Fase B — security-restanten (111 stuks, op ernst gesorteerd — de bovenste 25:
1. `src/app/api/admin/migrate-course-progress/route.ts:85` — Raw driver/DDL error text is returned to the caller (`error.message`), which can expose table/column names and SQL fragments. This is a schema-mutatio
2. `src/app/api/admin/migrate/belt-enum-values/route.ts:21` — `$executeRawUnsafe` with interpolated values is only safe here because `newValues` is a module-local constant; the moment the list becomes configurabl
3. `src/app/api/admin/migrate/fix-cursus-japans-diplomas/route.ts:115` — Returning the raw `error.message` to the client leaks internal details (Prisma/SQLite text, table/column names) on this endpoint, and the admin loses 
4. `src/app/api/admin/migrate/member-for-admin/route.ts:65` — Error handling leaks internals and uses `any`: `error.message` from Prisma/Postgres can contain table names, column names and constraint details (and 
5. `src/app/api/auth/forgot-password/route.ts:31` — This is a public, unauthenticated endpoint with no rate limiting: an attacker (or a page reload loop) can trigger an unbounded number of DB writes plu
6. `src/app/api/auth/login/route.ts:19` — Returning the raw `result` object of `login()` verbatim has two problems:
7. `src/app/api/diplomas/verify/route.ts:44` — This is a fully public, unauthenticated and unthrottled endpoint that exposes PII about (mostly minor) members: full name, belt grade, exam date, exam
8. `src/app/api/user/password/route.ts:31` — `verifyPassword` runs bcrypt (cost 12) on every unbounded request: there is no rate limiting or failed-attempt lockout on this endpoint. Combined with
9. `src/app/api/user/password/route.ts:40` — After a successful password change nothing invalidates existing sessions: the iron-session cookie is neither rotated nor destroyed, so all other devic
10. `src/lib/auth.ts:138` — `getCurrentUser()` returns the raw Prisma `User` record, which includes `passwordHash` (and every other user column) plus the full related `member` ro
11. `src/lib/db.ts:9` — De log-configuratie is hardcoded en geldt ook in productie. Twee problemen: (1) `log: ['query']` logt in productie elke SQL-query mét parameterwaarden
12. `src/lib/email.ts:254` — `firstName`/`lastName` komen rechtstreeks uit het publieke inschrijfformulier (de route valideert alleen aanwezigheid, geen lengte of tekens) en belan
13. `src/app/api/admin2/factuur/route.tsx:190` — `naam` is interpolated raw into the header. Because `factuurNr`/`periodeLabel` originate from the query string, a `"` in `periode` breaks the quoted f
14. `src/app/api/admin/diplomas/upload/route.ts:41` — MIME type is taken verbatim from client-supplied `file.type` with no allow-list, and the stored data URI is later served back with exactly that value 
15. `src/app/api/admin/migrate/add-preferred-group/route.ts:7` — The migration secret is hard-coded in source (`'michigami-migrate-2026'`), so it is committed to the repo and duplicated verbatim in `add-code-of-cond
16. `src/app/api/admin/migrate/belt-slip-system/route.ts:20` — This endpoint is completely unauthenticated and mutates 5 tables. The app is public (parents of members), so anyone can POST `/api/admin/migrate/belt-
17. `src/app/api/admin/students/route.ts:75` — The temporary password is fully deterministic and guessable: first 3 letters of both names + current year + '!'. Every member created in the same year
18. `src/app/api/diplomas/generate/route.ts:14` — This state-changing endpoint is completely unauthenticated. `createDiplomaOnExamPass()` inserts a `Diploma` row and overwrites `user.currentBelt` / `m
19. `src/app/api/exams/pending/route.ts:16` — `GET /api/exams/pending` heeft geen enkele authenticatie/autorisatie, terwijl `POST` hierboven/onder wel `isAdmin()` eist. Elke anonieme bezoeker van 
20. `src/app/api/admin2/factuur/route.tsx:111` — `periode` and `paymentId` come straight from the query string and are used unvalidated in (a) the `invoiceNumber startsWith` filter, (b) a **persisted
21. `src/app/api/admin/migrate/member-for-admin/route.ts:14` — **Auth-bypass (critical):** `isAdmin()` in `src/lib/auth.ts:121` is declared as `export async function isAdmin(): Promise<boolean>`. Without `await` t
22. `src/app/api/diplomas/download/route.tsx:25` — **Autorisatie ontbreekt volledig (IDOR / datalek tussen leden).** De docstring bovenaan belooft "Requires the user to be authenticated and own the dip
23. `src/app/admin/exams/bijeenkomst/Registratie.tsx:173` — The diploma link opens in a new tab without `rel="noopener noreferrer"`, which leaks a `window.opener` reference to the externally rendered print page
24. `src/app/admin/leden/page.tsx:53` — `toestemmingToken()` is a deterministic HMAC of the member id with **no expiry and no revocation** (`src/lib/toestemming-token.ts`), and it is the bea
25. `src/components/sections/GoogleMapEmbed.tsx:22` — The iframe loads third-party (Google) content with no `sandbox`, so the embedded document can open popups, submit forms and navigate the top frame — a

(alle 111 security-bevindingen staan in ../michigami-scan-2026-11-25.json, filter category=security)

## Fase C — belangrijkste bugs (top 25 van de 972) — ✅ GEDAAN 25 nov, zie commit "Fase C"
1. `src/app/api/admin2/inventory/verkoop/route.ts:23` — Classic check-then-create race on a `@unique` column: two concurrent POSTs in January (both hit the `materiaal` branch, e.g. two tabs in the materiaal
2. `src/app/api/admin2/lidinfo/[memberId]/route.ts:12` — `memberId` is taken straight from the URL and used as a query key without any validation. `findUnique` on an arbitrary value is safe against injection
3. `src/app/api/admin2/member-status/route.ts:76` — Only `LID` reopens previously exempted payments. A member who was `RESERVE`/`VRIJGESTELD` and is then set to `STOPPEND` or `PROEF` keeps the stale `VI
4. `src/lib/auth.ts:44` — `Object.assign(session, data)` is redundant dead code: every field it copies (`userId`, `email`, `name`, `role`, `loginTime`) is immediately overwritt
5. `src/app/api/admin2/factuur/route.tsx:147` — `periode` takes precedence over the payment's own period, so requesting `?paymentId=abc&periode=2025-Q1` while the payment belongs to `2024-Q3` labels
6. `src/app/api/admin/band-overzicht/route.ts:114` — De ruwe `e.message` (kan een Prisma/DB-interne boodschap zijn met kolom- of tabelnamen) wordt direct aan de cliënt teruggegeven; dat is onnodige intro
7. `src/app/api/admin/examens/klaar/route.ts:37` — The reuse branch re-uses an attempt that may already carry data from a **proefexamen**: ` ExamAttempt` keeps `categoryResults`, `overallScore`, `notes
8. `src/app/api/admin/examens/klaar/route.ts:23` — The three writes (`upsert` → `findFirst` → `update`/`create`) are not atomic. Two concurrent POSTs for the same member (double click, retry after a sl
9. `src/app/api/admin/examens/klaar/route.ts:50` — No validation of the request body: `request.json()` throws on malformed JSON (→ 500), and if `attemptId` is missing/`undefined` the `findUnique({ wher
10. `src/app/api/admin/examens/prep/route.ts:26` — The whole `checked` map is read, mutated in JS and written back, which is a classic read-modify-write race: with SQLite (WAL) a deferred transaction d
11. `src/app/api/admin/examens/route.ts:24` — Stille fallback: élke andere `type`-waard (`'proef'`, `'PROEF '`, `'proefexamen'`, typos, `undefined`) wordt zonder melding als `EXAMEN` opgeslagen. D
12. `src/app/api/admin/examens/route.ts:12` — Deze `db`-call (en de `requireAdmin()`/upsert-paden hieronder) ligt buiten elke try/catch. Een db-fout — including een `P2002` unique-conflict wanneer
13. `src/app/api/admin/examens/sittings/[id]/route.ts:16` — `body.memberId` is passed to Prisma without any validation. When it is missing/`undefined`/a non-string, `findUnique` throws a Prisma validation error
14. `src/app/api/admin/examens/sittings/[id]/route.ts:21` — `body.beltLevel as BeltLevel` is a blind cast: any string (or `undefined`) is accepted and only fails later inside Prisma as a 500. Validate against t
15. `src/app/api/admin/inschrijvingen/[id]/route.ts:32` — Check-then-update race: de PENDING-check en de latere `update` zijn niet atomisch. Twee gelijktijdige PATCHes (dubbelklik / twee tabs) passeren beide 
16. `src/app/api/admin/migrate/add-location-field/route.ts:40` — `catch (error: any)` plus a direct `error.message` deref is unsafe: when the thrown value is not an `Error` (string, Prisma error proxy re-thrown as `
17. `src/app/api/admin/migrate/add-pdf-url/route.ts:31` — `catch (error: any)` violates the project's TS rule (no `any` without justification) and makes the error handling unsafe: `error.message` throws a `Ty
18. `src/app/api/admin/migrate/member-for-admin/route.ts:19` — Missing scope: `role: 'ADMIN'` also matches deactivated accounts (`User.is_active` defaults to `true` but is set to `false` for disabled logins). Crea
19. `src/app/api/admin/students/[id]/route.ts:86` — `User.email` is normalised (`trim().toLowerCase()`) but `Member.email` is stored verbatim from the form (`...(body.email !== undefined && { email: bod
20. `src/app/api/admin/students/[id]/route.ts:55` — `dateOfBirth ? new Date(...) : undefined` is wrong for clearing: Prisma ignores `undefined`, so setting date of birth to empty (or an invalid string t
21. `src/app/api/admin/students/bulk/route.ts:14` — Inputvalidatie is te dun: `studentIds` wordt alleen gecontroleerd op `Array.isArray`/leeg. De elementen zelf worden niet gevalideerd (mogen `null`, ge
22. `src/app/api/admin/tournament/[slug]/route.ts:12` — The GET has no error handling either: a Prisma/SQLite failure surfaces as an unhandled 500 instead of a controlled response, and nothing is logged, so
23. `src/app/api/admin2/gast/route.ts:29` — `db.user.create` and `db.member.create` are two separate statements without a transaction. If the member insert fails (validation error, DB error), th
24. `src/app/api/admin2/inventory/verkoop/route.ts:47` — The parsed value is blindly cast to `FactItem[]` with no shape validation. If `payment.items` contains `"null"`, `"{}"` or a JSON object, `items.find`
25. `src/app/api/admin2/inventory/verkoop/route.ts:88` — No status guard on the existing payment: material lines can be added to a payment that is already `BETAALD` or `VIJGESTELD`, silently changing `amount

## Fase D — rest: bewust LATEN
De ~1000 maintainability/stijl/documentatie-bevindingen laten we staan: meuk corrigeren om de teller is ruis.
Ze komen pas opnieuw in beeld als een file écht aangepast wordt (review over een diff), dus ze verdwijnen vanzelf.

## Beleid tegen 'terugkomen'
1. Wekelijkse review-check kijkt alleen naar diffs → ongewijzigde code wordt niet heropgevoerd.
2. Full-scan (kwartaal) vergelijkt met deze punchlist: wat hier staat en nog niet gefixt is, melden we als 'herziening', niet als nieuw.
3. Eén fase per avond, 's nachts, elk pakje builds-groen vóór commit.
