import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';
import { SettingEx } from 'obsidian-dev-utils/obsidian/SettingEx';

import type { PluginTypes } from './PluginTypes.ts';

export class PluginSettingsTab extends PluginSettingsTabBase<PluginTypes> {
  public override display(): void {
    super.display();
    this.containerEl.empty();

    new SettingEx(this.containerEl)
      .setName('Frontmatter key')
      .setDesc('The frontmatter field to populate when creating a note from an unresolved link.')
      .addText((text) => {
        this.bind(text, 'frontmatterKey');
      });

    new SettingEx(this.containerEl)
      .setName('Wikilink fields')
      .setDesc('Comma-separated field names whose values will be auto-wrapped as [[wikilinks]]. Example: up, parent')
      .addText((text) => {
        this.bind(text, 'wikilinkFields');
      });

    new SettingEx(this.containerEl)
      .setName('Comma-separated list')
      .setDesc('When enabled, commas in the input create a YAML list. Each item is title-cased and wrapped as a [[wikilink]] if the field is in the wikilink list.')
      .addToggle((toggle) => {
        this.bind(toggle, 'commaList');
      });

  }
}
