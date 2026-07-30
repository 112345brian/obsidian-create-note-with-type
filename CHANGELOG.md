# Changelog

<!-- towncrier release notes start -->

## [0.2.1] - 2026-07-30

### Changed

- Migrated settings UI to Obsidian's new declarative settings API (requires Obsidian 1.13.0+).


## [0.2.0] - 2026-06-14

### Fixed

- Workspace event listeners (`layout-change`, `active-leaf-change`) are now properly deregistered via `offref` when the plugin unloads — previously they leaked and continued firing on the dead instance
- `active-leaf-change` no longer dismisses the popover when the user focuses a sidebar panel (file explorer, tags, etc.) — only switching to another markdown editor leaf dismisses it
- `findUnresolvedLinkElement` no longer writes `data-linktext` onto CodeMirror-owned DOM spans — the linktext is returned as a value instead of a side-effect mutation
- Frontmatter wikilink values for path-prefixed links (e.g. `folder/Note`) now write the bare basename `[[Note]]` instead of `[[folder/Note]]` when the metadata cache hasn't indexed the new file yet

## [0.1.0] - 2026-06-14

### Added

- Hover popover on unresolved wikilinks — shows a "Create" widget after a 100 ms debounce
- Frontmatter key input with configurable key name (settings: **Frontmatter key**)
- Wikilink wrapping for specified fields (settings: **Wikilink fields**)
- Comma-separated list support for multi-value frontmatter (settings: **Comma list**)
- Pressing Enter with an empty value shows a confirmation prompt using the active file's basename, then creates on a second Enter
- Viewport edge clamping — popover flips above the link when near the bottom, and clamps left/right within an 8 px margin
- Dismiss on scroll (any scrollable element)
- Dismiss on click outside the popover
- Dismiss when the active leaf changes
- 100 ms show debounce to prevent flicker on fast mouse movements
- Solid background, border, and shadow so the popover is readable over editor text

### Fixed

- Popover no longer appears on already-created notes in live-preview mode — `[[wikilink]]` brackets and `|alias` suffixes are now stripped before the metadata cache lookup
