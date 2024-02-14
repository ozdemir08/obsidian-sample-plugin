import { App, Editor, Modal, Notice } from "obsidian";
import { OpenAIClient } from "src/OpenAi/OpenAiClient";
import { TranscriptSummarizer } from "src/TranscriptSummarizer";

export class YoutubeVideoSummaryModal extends Modal {
	editor: Editor;
	openAiClient: OpenAIClient;
	transcriptSummarizer: TranscriptSummarizer;

	constructor(app: App, editor: Editor, openAIApiKey: string) {
		super(app);
		this.editor = editor;
		this.openAiClient = new OpenAIClient(openAIApiKey);
		this.transcriptSummarizer = new TranscriptSummarizer(this.openAiClient);
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

			this.transcriptSummarizer
				.getSummaryFromUrl(input.value)
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
