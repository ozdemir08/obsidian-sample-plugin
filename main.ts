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
import { PluginSettings, DEFAULT_SETTINGS, DEFAULT_TEMPLATE, DEFAULT_SUMMARY_SIZE, MAX_SUMMARY_SIZE, OPEN_AI_MODEL_CHOICES, DEFAULT_MODEL, OPEN_AI_MODELS_MAX_TOKEN_SIZES, DEFAULT_DATE_FORMAT } from "settings";

export default class MyPlugin extends Plugin {
	public settings: PluginSettings;

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
						this.settings,
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
			Object.assign(DEFAULT_SETTINGS, (await this.loadData()) ?? {})
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** Update plugin settings. */
	async updateSettings(settings: Partial<PluginSettings>) {
		Object.assign(this.settings, settings);
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
						await this.plugin.updateSettings({openAIApiKey: value});
					}),
			);
			new Setting(containerEl)
			.setName("OpenAI Model")
			.setDesc("Choose the OpenAI model to use.")
			.addDropdown((dropdown) => {
				// Explicitly define the accumulator type in the reduce function
				const options = OPEN_AI_MODEL_CHOICES.reduce<Record<string, string>>((acc, model) => {
					acc[model] = model; // Set both key and value to the model string
					return acc;
				}, {});
		
				dropdown
					.addOptions(options)
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						await this.plugin.updateSettings({openAIModel: value});
						await this.plugin.updateSettings({maxTokenSize: OPEN_AI_MODELS_MAX_TOKEN_SIZES[value as keyof typeof OPEN_AI_MODELS_MAX_TOKEN_SIZES]});
					});
			})
			;
		new Setting(containerEl)
			.setName("Minimum Summary Size")
			.setDesc("Minimum number of key points per video chunk to include in the generated summary. Note: The plugin divides long videos into chunks, extracts key points from each, and then combines them for the final summary.")
			.addText((text) =>
				text
					.setPlaceholder("3")
					.setValue("" + this.plugin.settings.summarySize)
					.onChange(async (value) => {
						let parsed = parseInt(value);
						if (isNaN(parsed)) return;
						parsed = parsed > MAX_SUMMARY_SIZE ? MAX_SUMMARY_SIZE : 
								 parsed < DEFAULT_SUMMARY_SIZE ? DEFAULT_SUMMARY_SIZE : parsed;
						await this.plugin.updateSettings({summarySize: parsed});
					})
			);
		new Setting(containerEl)
			.setName("Template format")
			.setDesc(
				"Enter format of template to be used when inserting summary.  Supported fields are {{Date}}, {{Title}}, {{ImageURL}}, {{Description}}, and {{VideoUrl}}.",
			)
			.addTextArea((text) => 
				text
					.setPlaceholder(DEFAULT_TEMPLATE)
					.setValue(this.plugin.settings.templateFormat)
					.onChange(async (value) => {
						await this.plugin.updateSettings({templateFormat: value});
					}),
			);
		new Setting(containerEl)
			.setName("Date format")
            .setDesc("The default date format.")
			.addTextArea((text) => 
				text
					.setPlaceholder(DEFAULT_DATE_FORMAT)
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						await this.plugin.updateSettings({dateFormat: value});
					}),
			);
		new Setting(containerEl)
			.setName("Reset defaults")
			.setDesc(
				`This will reset to the default settings (without removing your API key).
				The settings panel will be closed after pressing.
				`
				)
			.addButton((cb) => {
			  cb.setWarning()
				.setButtonText("Reset defaults")
				.onClick(() => {
					this.plugin.settings.summarySize = DEFAULT_SUMMARY_SIZE;
					this.plugin.settings.templateFormat = DEFAULT_TEMPLATE;
					this.plugin.settings.dateFormat = DEFAULT_DATE_FORMAT;
					this.plugin.settings.openAIModel = OPEN_AI_MODEL_CHOICES[0];
					this.plugin.settings.maxTokenSize = OPEN_AI_MODELS_MAX_TOKEN_SIZES[DEFAULT_MODEL as keyof typeof OPEN_AI_MODELS_MAX_TOKEN_SIZES];
				  	this.plugin.saveSettings();
					this.plugin.unload();
					this.plugin.load();
				});
			});
	}
}
