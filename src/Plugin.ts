import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import type { PluginTypes } from './PluginTypes.ts';

import { DeadLinkPopoverManager } from './DeadLinkPopover.ts';
import { PluginSettingsManager } from './PluginSettingsManager.ts';
import { PluginSettingsTab } from './PluginSettingsTab.ts';

export class Plugin extends PluginBase<PluginTypes> {
  private deadLinkPopover!: DeadLinkPopoverManager;

  protected override createSettingsManager(): PluginSettingsManager {
    return new PluginSettingsManager(this);
  }

  protected override createSettingsTab(): PluginSettingsTab {
    return new PluginSettingsTab(this);
  }

  protected override async onloadImpl(): Promise<void> {
    await super.onloadImpl();

    this.deadLinkPopover = new DeadLinkPopoverManager(
      this.app,
      () => this.settings.frontmatterKey,
      () => this.settings.wikilinkFields,
      () => this.settings.commaList
    );

    this.registerDomEvent(document, 'mouseover', (e) => {
      this.deadLinkPopover.onMouseOver(e);
    });

    this.registerDomEvent(document, 'mousedown', (e) => {
      this.deadLinkPopover.onMouseDown(e);
    }, true);

    this.registerDomEvent(document, 'mouseleave', (e) => {
      this.deadLinkPopover.onMouseLeave(e);
    }, true);

    this.registerDomEvent(document, 'scroll', () => {
      this.deadLinkPopover.onScroll();
    }, true);
  }

  protected override async onunloadImpl(): Promise<void> {
    await super.onunloadImpl();
    this.deadLinkPopover.stop();
  }
}
