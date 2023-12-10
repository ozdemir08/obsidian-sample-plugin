import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { YoutubeVideoSummaryModal } from 'src/Modals/YoutubeVideoSummaryModal';

interface PluginSettings {
	openAIApiKey: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openAIApiKey: '<REPLACE_THIS_WITH_YOUR_API_KEY>'
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'generate-video-summary',
			name: 'Generate video summary',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(this.settings.openAIApiKey);
				let openAiApiKey = this.settings.openAIApiKey;

				if (openAiApiKey == undefined || openAiApiKey == '' || openAiApiKey == DEFAULT_SETTINGS.openAIApiKey) {
					new Notice('Open AI Api key is not added. Please, go to the settings and add it.');
				} else {
					new YoutubeVideoSummaryModal(this.app, editor, this.settings.openAIApiKey).open();
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('open-ai-api-key')
			.setDesc('Enter your Open AI API Key to be able to generate summaries from transcripts.')
			.addText(text => text
				.setPlaceholder('Enter your API KEY')
				.setValue(this.plugin.settings.openAIApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openAIApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
