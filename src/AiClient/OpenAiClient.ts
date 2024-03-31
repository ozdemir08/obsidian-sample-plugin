import OpenAI from "openai";
import { AiClient } from "src/AiClient/AiClient";
import { PluginSettings } from "settings";

export class OpenAIClient implements AiClient {

	openai: OpenAI;
	model: string;

	constructor(settings: PluginSettings) {
		this.model = settings.enableLocalModel ? settings.localModel : settings.openAIModel;
		this.openai = new OpenAI({
			apiKey: settings.openAIApiKey,
			dangerouslyAllowBrowser: true
		})
	}
 
	async query(content: string): Promise<string> {
		console.debug("Querying OpenAI with content: ", content);
		console.debug("Model: ", this.model);
		const chatCompletion = await this.openai.chat.completions.create({
			messages: [{ role: 'assistant', content: content }],
			model: this.model,
		});

		return chatCompletion.choices.at(0)?.message.content!;
	}
}
