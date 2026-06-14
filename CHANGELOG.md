# Changelog

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
