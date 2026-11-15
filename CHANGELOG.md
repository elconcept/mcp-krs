# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) +
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] — 2026-11-15

### Fixed

- `get_entity_full`: preserves versioned historical KRS entries and does not coerce objects into `[object Object]`.
- Current status and representation are sourced from a separate current extract, not historical dissolution or liquidation entries.
- Includes extract date and history provenance in structured citations; explicit warning when current extract is unavailable.
- NAS deployment uses the existing external Docker network `cf_edge_mcp` instead of the nonexistent `cf_mcp_krs`.
- Live regression scenario for mBank SA (KRS `0000025237`).

## [1.1.0] — 2026-05-25

Retrofit do kanonu MCP MateMatic (pattern z dograh v1.31.0 BSD-2). Backward-compatible.

### Added

- `instructions` w Server (snapshot in time / data odpisu kluczowa, rejestr P vs S, RODO ostrzezenie przy budowie profili osob).
- `ToolAnnotations` per tool (`readOnlyHint`, `openWorldHint=true` bo MS API live).
- Strukturalne `ErrorCode`: `missing_arg`, `invalid_krs`, `not_found`, `upstream_error`. Format `[code] tekst` + `structuredContent.error_code`.
- Walidacja formatu KRS (1-10 cyfr) przed wyslaniem do upstream.
- Routing HTTP 404 -> `not_found` z sugestia spr drugiego rejestru.
- Drift test (`npm run drift`).

## [1.0.0] — 2026-05-20

Initial public release.

Polish company registry (KRS) via official, free Ministry of Justice JSON API. No key required. 3 tools: get_entity / get_entity_full / get_board.

### Highlights

- Node 18+ stdio MCP server, single `dist/index.js` entry.
- LIVE smoke-tested on real data.
- `structuredContent.citations` consumed by [Patron](https://github.com/matematicsolutions/patron)
  and any other MCP-aware legal agent.
- MIT license, 500 ms request throttle, zero secrets required.

[1.0.0]: https://github.com/matematicsolutions/mcp-krs/releases/tag/v1.0.0
