# KRS — plan naprawy parsera odpisu pełnego i dostępności zarządu

> Audyt: 2026-10-31. Źródła: test wszystkich narzędzi przez portal lex.xlap.pl/mcp, testy bezpośrednich kontenerów przez Portainer/Synology, kontrola kodu repozytoriów elconcept. To **plan**, nie potwierdzenie wdrożenia naprawy. Oznaczenia: **POTWIERDZONE** = zaobserwowany wynik i/lub wskazana przyczyna w kodzie; **DO SPRAWDZENIA** = hipoteza. 

## Reguły wspólne
- Publiczny interfejs narzędzi, zapytania w języku naturalnym, metadane prezentacyjne, fragmenty i błędy: **tylko po polsku**. Bez widocznego selektora języka. Identyfikatory techniczne, oryginalne sygnatury i adresy źródłowe pozostają niezmienione. W okresie migracji stary parametr `lang` można akceptować dla zgodności, ignorować i stosować PL; potem usunąć z publicznego schematu.
- Wyniki prawne nie mogą być dopowiadane. Rozróżniać tekst urzędowy (ze wskazaniem języka i źródła) od komentarza/nieurzędowego przekładu; przy braku wiarygodnej polskiej wersji raportować brak, nie zastępować angielskim tekstem ani nie udawać polskiej wersji urzędowej.
- MCP `content` (dane merytoryczne) **i** `structuredContent` (metadane) zachować równolegle. Testować bezpośrednio oraz przez Cloudflare i portal `lex`; nie uznawać samej listy `citations` za sukces funkcjonalny.
- Diagnostyka i testy przed zmianą produkcyjną; PR → testy offline → smoke staging → porównanie surowych odpowiedzi → kontrolowany rollout → monitoring/rollback. Nigdy nie publikować haseł, tokenów, PII ani pełnych logów uwierzytelnienia.

## Materiał dowodowy
- **POTWIERDZONE:** dla KRS `0000028860` odpis aktualny zwrócił nazwę jako string i `reprezentacja.sklad` jako tablicę 10 osób; odpis pełny zawiera historyczne `danePodmiotu.nazwa` jako tablicę obiektów, a `dzial6.rozwiazanieUniewaznienie` jako obiekt historyczny.
- **POTWIERDZONE:** `get_entity_full` w portalu pokazał `[object Object]` i status `rozwiazana`, podczas gdy `get_entity` wskazał `aktywny`. W `src/index.ts` `detectStatus()` klasyfikuje po samej truthiness `dzial6.rozwiazanieUniewaznienie`; `buildCitation()` interpoluje historyczną tablicę jak string.
- **POTWIERDZONE:** w API pole organu to `nazwaOrganu`, a `Organ` w kodzie przewiduje `nazwa`. Bezpośrednie `get_board` na kontenerze zwróciło 10 osób i reprezentację w `content`; portal `lex` udostępnił tylko citation bez listy osób.
- **DO SPRAWDZENIA:** pełna semantyka zakończenia likwidacji/rozwiązania, historię organów i ich dat skuteczności, warianty KRS typ `S`.

## Plan
1. **P0 — model typów:** osobne TypeScript DTO dla `OdpisAktualny` i `OdpisPelny` zgodne z rzeczywistym JSON MS API. Wersje historyczne jako uporządkowana lista `{wartość, nrWpisuWprow, nrWpisuWykr}`, nie string; dla statusu bieżącego wyłącznie bieżący stan, daty i skutki wpisów. Nie wywodzić rozwiązania z obecności obiektu historycznego.
2. **P0 — poprawny `get_board`:** `nazwaOrganu`, skład, funkcja, prokura i zasady reprezentacji; zachować pełny `content` w kliencie portalu. Dodać datę odpisu (`stanZDnia`/`dataCzasOdpisu`) i rozróżnienie pochodzenia bieżącego/historycznego.
3. **P1 — format bez `[object Object]`:** historia nazw/zarządów w osobnej sekcji z numerami wpisów, albo jawne zaznaczenie, że brak rozstrzygnięcia bieżącego stanu. Usunąć logiczne sprzeczności `get_entity` vs `get_entity_full`.
4. **P1 — ścisłe testy fixture:** ORLEN, podmiot w likwidacji, rzeczywiście wykreślony, fundacja (S), wpis z wieloma zmianami zarządu; testy JSON, kompozycja cytowań i wynik w portalu vs kontener.
5. **P2 — dokumentacja i rollout:** `src/index.ts`, `src/api-response.ts`, testy, `README.md`; bez zmiany oficjalnego API, bez utrwalania niepotrzebnych danych osobowych w logach.

## Akceptacja
- ORLEN `0000028860` ma status bieżący `aktywny` w obu narzędziach, historyczne nazwy są czytelne; `[object Object]` nigdy nie występuje.
- `get_board` wyświetla skład, funkcje, reprezentację i ewentualną prokurę w polskim `content` także przez portal; daty są dostępne dla cytowania.
- Wszystkie fixtures mają deterministyczne wyniki i brak false-positive `rozwiazana`.

## Pliki / dowody
`src/index.ts`, `src/api-response.ts`, `test/api-response.mjs`, oficjalne API KRS, portal `lex`.
