import { App, Editor, Modal, Notice } from "obsidian";
import { OpenAIClient } from "src/OpenAi/OpenAiClient";
import { TranscriptSummarizer } from "src/TranscriptSummarizer";
import { PluginSettings, YOUTUBE_BASE_URL } from "settings";

export class YoutubeVideoSummaryModal extends Modal {
	editor: Editor;
	openAiClient: OpenAIClient;
	transcriptSummarizer: TranscriptSummarizer;
	settings: PluginSettings;

	constructor(app: App, editor: Editor, settings: PluginSettings) {
		super(app);
		this.settings = settings;
		this.editor = editor;
		this.openAiClient = new OpenAIClient(this.settings.openAIApiKey);
		this.transcriptSummarizer = new TranscriptSummarizer(this.openAiClient, this.settings);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h3", { text: "Enter Youtube video url:" });
		const input = contentEl.createEl("input", { type: "text" });
		contentEl.createEl("br");
		contentEl.createEl("br");
		const button = contentEl.createEl("button", {
			text: "Generate summary",
		});

		button.addEventListener("click", () => {
			new Notice("Generating summary...");

			// handle both full URL and only video IDs
			let url = input.value;
			console.debug("URL: ", url);
			if (url.search('https://') == -1 && url.search('watch?') == -1) url = `https://www.${YOUTUBE_BASE_URL}/watch?v=${url}`;
			console.debug("URL: ", url);
			
			this.transcriptSummarizer
				.getSummaryFromUrl(url)
				.then((summary) => {
					this.appendToWindow(summary);
					this.close();
				})
				.catch((error) => {
					new Notice("Error: " + error);
				});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	appendToWindow(text: string) {
		if (this.editor != null) {
			const currentValue = this.editor.getValue();
			this.editor.setValue(currentValue + "\n" + text);
		}
	}
}
