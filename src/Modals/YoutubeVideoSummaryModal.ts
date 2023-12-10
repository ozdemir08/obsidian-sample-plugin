import { App, Editor, Modal } from "obsidian";
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
		let { contentEl } = this;
		contentEl.createEl("h3", { text: "Enter Youtube video url:" });
		let input = contentEl.createEl("input", { type: "text" });
		contentEl.createEl("br");
		contentEl.createEl("br");
		let button = contentEl.createEl("button", { text: "Generate summary" });

		button.addEventListener("click", async () => {
			let summary = await this.transcriptSummarizer.getSummaryFromUrl(input.value);
			this.appendToWindow(summary);
			this.close();
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}

	appendToWindow(text: string) {
		if (this.editor != null) {
			let currentValue = this.editor.getValue();
			this.editor.setValue(currentValue + '\n' + text);
		}
	}
}
