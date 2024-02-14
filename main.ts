import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { YoutubeVideoSummaryModal } from "src/Modals/YoutubeVideoSummaryModal";

interface PluginSettings {
	openAIApiKey: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openAIApiKey: "",
};

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "generate-video-summary",
			name: "Generate video summary",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const openAiApiKey = this.settings.openAIApiKey;

				if (openAiApiKey == undefined || openAiApiKey == "") {
					new Notice(
						"OpenAI Api key is not added. Please, go to the settings and add it.",
					);
				} else {
					new YoutubeVideoSummaryModal(
						this.app,
						editor,
						this.settings.openAIApiKey,
					).open();
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
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
			.setName("OpenAI key")
			.setDesc(
				"Enter your OpenAI API Key to be able to generate summaries from transcripts.",
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key")
					.setValue(this.plugin.settings.openAIApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIApiKey = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
