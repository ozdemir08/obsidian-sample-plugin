import { YoutubeTranscript } from "youtube-transcript";
import { OpenAIClient } from "./OpenAi/OpenAiClient";
import { YoutubeMetadataParser } from "./YoutubeMetadataParser/YoutubeVideoMetadataParser";
import { PluginSettings, MAX_TOKEN_SIZE_IN_A_REQUEST } from "settings";

export class TranscriptSummarizer {
	constructor(private openAiClient: OpenAIClient, private settings: PluginSettings) { }

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
				startIndex + MAX_TOKEN_SIZE_IN_A_REQUEST > words.length
					? words.length - 1
					: startIndex + MAX_TOKEN_SIZE_IN_A_REQUEST;
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
		return this.openAiClient.query(this.constructPrompt() + transcript);
	}

	constructPrompt() {
		let numberOfKeyPoints = this.settings.summarySize;
		if (numberOfKeyPoints == 0) numberOfKeyPoints = 3;
		let prompt = `Below is a transcript of a Youtube video. Can you give me ${numberOfKeyPoints} key points and return the results as an unordered markdown list? \n --- \n`;
		console.debug("prompt", prompt)
		return prompt;
	}
}
