import { YoutubeTranscript } from "youtube-transcript";
import { AiClient } from "src/AiClient/AiClient";
import { YoutubeMetadataParser } from "./YoutubeMetadataParser/YoutubeVideoMetadataParser";
import { PluginSettings } from "settings";

export class TranscriptSummarizer {
	constructor(private aiClient: AiClient, private settings: PluginSettings) { }

	async getSummaryFromUrl(url: string): Promise<string> {
		const youtubeMetadata = await new YoutubeMetadataParser(this.settings).getVideoNote(
			url,
		);

		const transcriptList = await YoutubeTranscript.fetchTranscript(url);
		const transcript = transcriptList
			.map((transcript) => transcript.text)
			.join(" ");

		const words = transcript.split(" ");
		let startIndex = 0;

		const keyPointPromises = [];

		// Split the transcript into smaller pieces if necessary.
		while (startIndex < words.length - 1) {
			const endIndex =
				startIndex + this.settings.maxTokenSize > words.length
					? words.length - 1
					: startIndex + this.settings.maxTokenSize;
			const transcriptChunk = words.slice(startIndex, endIndex).join(" ");
			startIndex = endIndex;

			keyPointPromises.push(
				this.getKeyPointsFromTranscript(transcriptChunk),
			);
		}

		const keyPoints = await Promise.all(keyPointPromises);
		return youtubeMetadata.content + "\n" + keyPoints.join("\n");
	}

	async getKeyPointsFromTranscript(transcript: string): Promise<string> {
		return this.aiClient.query(this.constructPrompt() + transcript);
	}

	constructPrompt() {
		let numberOfKeyPoints = this.settings.summarySize;
		if (numberOfKeyPoints == 0) numberOfKeyPoints = 3;
		let prompt = `Below is a transcript of a Youtube video. Can you give me ${numberOfKeyPoints} key points and return the results as an unordered markdown list? \n --- \n`;
		console.debug("prompt", prompt)
		return prompt;
	}
}
