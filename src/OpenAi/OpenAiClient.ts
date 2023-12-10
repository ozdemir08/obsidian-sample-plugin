import OpenAI from "openai";

export class OpenAIClient {

	openai: OpenAI;

	constructor(apiKey: string) {
		this.openai = new OpenAI({
			apiKey: apiKey,
			dangerouslyAllowBrowser: true
		})
	}
 
	async query(content: string): Promise<string> {
		const chatCompletion = await this.openai.chat.completions.create({
			messages: [{ role: 'assistant', content: content }],
			model: 'gpt-3.5-turbo',
		});

		return chatCompletion.choices.at(0)?.message.content!;
	}
}
