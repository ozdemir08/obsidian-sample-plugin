import { YoutubeTranscript } from "youtube-transcript";
import { OpenAIClient } from "./OpenAi/OpenAiClient";
import { YoutubeMetadataParser } from "./YoutubeMetadataParser/YoutubeVideoMetadataParser";

const PROMPT = "Below is a transcript of a Youtube video. Can you give me 3 key points and return the results as an unordered markdown list? \n --- \n"
const MAX_TOKEN_SIZE_IN_A_REQUEST = 2500;

export class TranscriptSummarizer {

	openAiClient: OpenAIClient;

	constructor(openAiClient: OpenAIClient) {
		this.openAiClient = openAiClient;
	}

	async getSummaryFromUrl(url: string): Promise<string> {
		let youtubeMetadata = await new YoutubeMetadataParser().getVideoNote(url);

		let transcriptList = await YoutubeTranscript.fetchTranscript(url);
		let transcript = transcriptList.map(transcript => transcript.text).join(' ');

		let keyPoints = '';

		let words = transcript.split(' ');
		let startIndex = 0;

		console.log('Getting the summary...');
		console.log(words.length);
		
		// Split the transcript into smaller pieces if necessary. 
		while (startIndex < words.length - 1) {
			let endIndex = startIndex + MAX_TOKEN_SIZE_IN_A_REQUEST > words.length ? words.length - 1 : startIndex + MAX_TOKEN_SIZE_IN_A_REQUEST;
			console.log(startIndex + ' ' + endIndex);
			let transcriptChunk = words.slice(startIndex, endIndex).join(' ');
			startIndex = endIndex;

			let keyPointsOfChunk = await this.getKeyPointsFromTranscript(transcriptChunk);
			keyPoints = keyPoints.concat(keyPointsOfChunk);
		}

		return youtubeMetadata.content + '\n' + keyPoints;
	}

	async getKeyPointsFromTranscript(transcript: string): Promise<string> {
		return this.openAiClient.query(PROMPT + transcript);
	}
}
