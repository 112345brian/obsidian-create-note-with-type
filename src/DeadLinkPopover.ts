import type { App, WorkspaceLeaf } from 'obsidian';

import { normalizePath, TFile } from 'obsidian';

export class DeadLinkPopoverManager {
  private currentPopover: HTMLElement | null = null;
  private hideTimer: number | null = null;
  private showTimer: number | null = null;
  private hoveredLeaf: WorkspaceLeaf | null = null;
  private leafListenerCleanups: (() => void)[] = [];

  public constructor(
    private readonly app: App,
    private readonly getFrontmatterKey: () => string,
    private readonly getWikilinkFields: () => string,
    private readonly getCommaList: () => boolean
  ) {
    this.app.workspace.onLayoutReady(() => { this.registerLeafTrackers(); });
    this.app.workspace.on('layout-change', () => { this.registerLeafTrackers(); });
    this.app.workspace.on('active-leaf-change', () => { this.dismissPopover(); });
  }

  public stop(): void {
    this.dismissPopover();
    for (const cleanup of this.leafListenerCleanups) cleanup();
    this.leafListenerCleanups = [];
  }

  public onScroll(): void {
    this.dismissPopover();
  }

  public onMouseDown(e: MouseEvent): void {
    if (!this.currentPopover) return;
    if (e.target instanceof Node && this.currentPopover.contains(e.target)) return;
    this.dismissPopover();
  }

  private registerLeafTrackers(): void {
    for (const cleanup of this.leafListenerCleanups) cleanup();
    this.leafListenerCleanups = [];

    this.app.workspace.iterateAllLeaves((leaf) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container = (leaf as any).containerEl as HTMLElement | undefined;
      if (!container) return;

      const onEnter = (): void => { this.hoveredLeaf = leaf; };
      const onLeave = (): void => { if (this.hoveredLeaf === leaf) this.hoveredLeaf = null; };

      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mouseleave', onLeave);
      this.leafListenerCleanups.push(() => {
        container.removeEventListener('mouseenter', onEnter);
        container.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  public onMouseOver(e: MouseEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('.note-type-creator-popover')) {
      this.cancelHide();
      return;
    }

    const anchor = this.findUnresolvedLinkElement(target);
    if (!anchor) {
      this.scheduleHide();
      return;
    }

    this.cancelHide();

    const linktext = anchor.dataset['linktext'] ?? '';
    if (this.currentPopover?.dataset['href'] === linktext) return;

    const sourcePath = this.getSourcePath();
    const anchorRect = anchor.getBoundingClientRect();
    this.cancelShow();
    this.showTimer = window.setTimeout(() => {
      this.showTimer = null;
      this.showPopover(anchorRect, linktext, sourcePath);
    }, 100);
  }

  private findUnresolvedLinkElement(target: HTMLElement): HTMLElement | null {
    // Reading view: <a class="internal-link is-unresolved">
    const readingLink = target.closest('a.internal-link.is-unresolved');
    if (readingLink instanceof HTMLElement) {
      readingLink.dataset['linktext'] = readingLink.getAttribute('data-href') ?? readingLink.textContent ?? '';
      return readingLink;
    }

    // Live preview: <span class="cm-hmd-internal-link"> — no resolved/unresolved class,
    // must check the metadata cache ourselves
    const editorSpan = target.closest('.cm-hmd-internal-link');
    if (editorSpan instanceof HTMLElement) {
      // textContent includes the [[ ]] brackets and optional |alias suffix
      let raw = editorSpan.textContent?.trim() ?? '';
      raw = raw.replace(/^\[\[/, '').replace(/\]\]$/, '');
      const linktext = raw.includes('|') ? raw.slice(0, raw.indexOf('|')) : raw;
      if (!linktext) return null;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(linktext, this.getSourcePath());
      if (resolved) return null;
      editorSpan.dataset['linktext'] = linktext;
      return editorSpan;
    }

    return null;
  }

  public onMouseLeave(e: MouseEvent): void {
    const target = e.relatedTarget;
    if (target instanceof HTMLElement && (
      target.closest('.note-type-creator-popover') ||
      target.closest('a.internal-link.is-unresolved')
    )) return;
    this.scheduleHide();
  }

  private showPopover(anchorRect: DOMRect, linktext: string, sourcePath: string): void {
    this.dismissPopover();

    const popover = document.body.createDiv({ cls: 'note-type-creator-popover' });
    popover.dataset['href'] = linktext;

    popover.style.position = 'fixed';
    popover.style.zIndex = '1000';
    // Place off-screen first so we can measure before clamping
    popover.style.top = '-9999px';
    popover.style.left = '-9999px';

    this.currentPopover = popover;
    this.buildWidget(popover, linktext, sourcePath);

    // Clamp to viewport after the element is in the DOM and measurable
    const pw = popover.offsetWidth;
    const ph = popover.offsetHeight;
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = anchorRect.bottom + 6;
    let left = anchorRect.left;

    // Flip above the anchor if it would overflow the bottom
    if (top + ph > vh - margin) {
      top = anchorRect.top - ph - 6;
    }
    // Clamp right edge
    if (left + pw > vw - margin) {
      left = vw - pw - margin;
    }
    // Clamp left edge
    if (left < margin) {
      left = margin;
    }
    // Ensure top doesn't go above viewport
    if (top < margin) {
      top = margin;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    popover.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
  }

  private buildWidget(popover: HTMLElement, linktext: string, sourcePath: string): void {
    const key = this.getFrontmatterKey();

    const body = popover.createDiv({ cls: 'note-type-creator-body' });

    body.createEl('div', {
      cls: 'note-type-creator-title',
      text: `Create "${linktext}"`
    });

    const row = body.createDiv({ cls: 'note-type-creator-row' });
    row.createEl('span', { cls: 'note-type-creator-key', text: `${key}:` });

    const input = row.createEl('input', {
      attr: { placeholder: 'value…', type: 'text' },
      cls: 'note-type-creator-input'
    });

    const hint = body.createEl('div', {
      cls: 'note-type-creator-hint',
      text: '↵ create  ·  Esc cancel'
    });

    window.setTimeout(() => input.focus(), 0);

    let pendingFallback: string | null = null;

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
          pendingFallback = null;
          void this.createNote(linktext, sourcePath, key, value);
          this.dismissPopover();
          return;
        }
        const fallback = this.app.workspace.getActiveFile()?.basename ?? '';
        if (!fallback) return;
        if (pendingFallback === fallback) {
          void this.createNote(linktext, sourcePath, key, fallback);
          this.dismissPopover();
        } else {
          pendingFallback = fallback;
          hint.textContent = `↵ confirm "${fallback}"  ·  Esc cancel`;
          hint.classList.add('note-type-creator-hint--confirm');
        }
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        this.dismissPopover();
      } else {
        pendingFallback = null;
        hint.textContent = '↵ create  ·  Esc cancel';
        hint.classList.remove('note-type-creator-hint--confirm');
      }
    });
  }

  private scheduleHide(): void {
    this.cancelShow();
    if (this.hideTimer !== null) return;
    this.hideTimer = window.setTimeout(() => {
      this.hideTimer = null;
      this.dismissPopover();
    }, 300);
  }

  private cancelHide(): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private cancelShow(): void {
    if (this.showTimer !== null) {
      window.clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private dismissPopover(): void {
    this.cancelHide();
    this.cancelShow();
    this.currentPopover?.detach();
    this.currentPopover = null;
  }

  private getSourcePath(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (this.hoveredLeaf?.view as any)?.file;
    if (file) return file.path as string;
    return this.app.workspace.getActiveFile()?.path ?? '';
  }

  private async createNote(linktext: string, sourcePath: string, key: string, value: string): Promise<void> {
    let targetPath: string;
    if (linktext.includes('/')) {
      targetPath = normalizePath(`${linktext}.md`);
    } else {
      const sourceFolder = sourcePath.includes('/')
        ? sourcePath.substring(0, sourcePath.lastIndexOf('/'))
        : '';
      targetPath = normalizePath(sourceFolder ? `${sourceFolder}/${linktext}.md` : `${linktext}.md`);
    }

    const folderPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
    if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
      await this.app.vault.createFolder(folderPath);
    }

    let file: TFile;
    try {
      file = await this.app.vault.create(targetPath, '');
    } catch {
      const existing = this.app.vault.getAbstractFileByPath(targetPath);
      if (!(existing instanceof TFile)) return;
      file = existing;
    }

    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const wikilinkFields = this.getWikilinkFields()
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      const shouldWikilink = wikilinkFields.includes(key);

      const formatOne = (raw: string): string => {
        const trimmed = raw.trim();
        if (!trimmed) return '';
        const existing = this.app.metadataCache.getFirstLinkpathDest(trimmed, sourcePath);
        const name = existing ? existing.basename : trimmed;
        return shouldWikilink && !name.startsWith('[[') ? `[[${name}]]` : name;
      };

      if (this.getCommaList() && /(?<!\\),/.test(value)) {
        const items = value
          .split(/(?<!\\),/)
          .map((item) => formatOne(item.replace(/\\,/g, ',')))
          .filter(Boolean);
        fm[key] = items;
      } else {
        fm[key] = formatOne(value.replace(/\\,/g, ','));
      }
    });
  }
}
