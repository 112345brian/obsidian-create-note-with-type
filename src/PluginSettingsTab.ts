import type { SettingDefinitionItem } from 'obsidian';

import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';

import type { PluginTypes } from './PluginTypes.ts';

export class PluginSettingsTab extends PluginSettingsTabBase<PluginTypes> {
  public override getControlValue(key: string): unknown {
    return (this.plugin.settings as unknown as Record<string, unknown>)[key];
  }

  public override getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        control: { key: 'frontmatterKey', type: 'text' as const },
        desc: 'The frontmatter field to populate when creating a note from an unresolved link.',
        name: 'Frontmatter key'
      },
      {
        control: { key: 'wikilinkFields', type: 'text' as const },
        desc: 'Comma-separated field names whose values will be auto-wrapped as [[wikilinks]]. Example: up, parent',
        name: 'Wikilink fields'
      },
      {
        control: { key: 'commaList', type: 'toggle' as const },
        desc: 'When enabled, commas in the input create a YAML list. Each item is title-cased and wrapped as a [[wikilink]] if the field is in the wikilink list.',
        name: 'Comma-separated list'
      }
    ];
  }

  public override async setControlValue(key: string, value: unknown): Promise<void> {
    await this.plugin.settingsManager.setProperty(
      key as keyof PluginTypes['pluginSettings'],
      value as PluginTypes['pluginSettings'][keyof PluginTypes['pluginSettings']]
    );
  }
}
