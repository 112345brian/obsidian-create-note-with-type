# Note Type Creator

[![GitHub release](https://img.shields.io/github/v/release/112345brian/obsidian-create-note-with-type)](https://github.com/112345brian/obsidian-create-note-with-type/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/112345brian/obsidian-create-note-with-type/total)](https://github.com/112345brian/obsidian-create-note-with-type/releases)

Hover over an unresolved `[[wikilink]]` to instantly create the note with a frontmatter field pre-filled — no modal, no menu, no leaving the editor.

## How it works

1. Hover over a dead link in Reading view or Live Preview. After a brief delay a small popover appears.
2. Type the value for the configured frontmatter key (e.g. `type: person`).
3. Press **↵** to create the note. The note is created in the same folder as the source file and its frontmatter is written immediately.

If you press **↵** without entering a value, the popover shows a confirmation prompt using the active file's basename as the value. Press **↵** again to confirm or **Esc** to cancel.

Press **Esc** at any time, click outside the popover, or scroll to dismiss it without creating anything.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Frontmatter key** | `type` | The frontmatter key written to the new note. |
| **Wikilink fields** | *(empty)* | Comma-separated list of keys whose values should be wrapped in `[[...]]`. |
| **Comma list** | off | When enabled, comma-separated input is written as a YAML list. |

## Installation

The plugin is not yet in the official Community Plugins directory.

### Via BRAT (recommended for now)

1. Install and enable the [BRAT plugin](https://obsidian.md/plugins?id=obsidian42-brat).
2. Click [Install via BRAT](https://intradeus.github.io/http-protocol-redirector?r=obsidian://brat?plugin=https://github.com/112345brian/obsidian-create-note-with-type).
3. In the BRAT pop-up, click **Add plugin** and wait a few seconds.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/112345brian/obsidian-create-note-with-type/releases/latest).
2. Copy them into `<vault>/.obsidian/plugins/create-note-with-type/`.
3. Enable the plugin in **Settings → Community plugins**.

## Debugging

Debug messages are hidden by default. To show them, run in the DevTools Console:

```js
window.DEBUG.enable('create-note-with-type');
```

See the [obsidian-dev-utils debugging docs](https://github.com/mnaoumov/obsidian-dev-utils/blob/main/docs/debugging.md) for more.

## License

© [Brian Powers](https://github.com/112345brian/) — MIT
