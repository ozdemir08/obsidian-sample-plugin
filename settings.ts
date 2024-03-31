/** Constants */
export const YOUTUBE_BASE_URL = "youtube.com";
export const DEFAULT_TEMPLATE = "---\ndate: {{Date}}\n---\n# {{Title}}\n![]({{ImageURL}})\n## Description:\n{{Description}}\n-> [Youtube video Link]({{VideoUrl}})\n\n## Summary:\n";
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_SUMMARY_SIZE = 3;
export const MAX_SUMMARY_SIZE = 20;
export const OPEN_AI_MODEL_CHOICES = ["gpt-3.5-turbo","gpt-4","gpt-4-0125-preview","gpt-4-turbo-preview","gpt-4-1106-preview","gpt-4-vision-preview","gpt-4-0613","gpt-4-32k","gpt-4-32k-0613","gpt-3.5-turbo-1106","gpt-3.5-turbo-16k","gpt-3.5-turbo-instruct","gpt-3.5-turbo-0613","gpt-3.5-turbo-16k-0613","gpt-3.5-turbo-0301"];
export const OPEN_AI_MODELS_MAX_TOKEN_SIZES = {
	"gpt-3.5-turbo": 4096,
	"gpt-4": 8192,
	"gpt-4-0125-preview": 128000,
	"gpt-4-turbo-preview": 128000,
	"gpt-4-1106-preview": 128000,
	"gpt-4-vision-preview": 128000,
	"gpt-4-0613": 8192,
	"gpt-4-32k": 32768,
	"gpt-4-32k-0613": 32768,
	"gpt-3.5-turbo-1106": 16385,
	"gpt-3.5-turbo-16k": 16384,
	"gpt-3.5-turbo-instruct": 4096,
	"gpt-3.5-turbo-0613": 4096,
	"gpt-3.5-turbo-16k-0613": 16384,
	"gpt-3.5-turbo-0301": 4096
};
export const DEFAULT_MODEL = OPEN_AI_MODEL_CHOICES[0];
export const DEFAULT_TOKEN_SIZE = OPEN_AI_MODELS_MAX_TOKEN_SIZES[DEFAULT_MODEL as keyof typeof OPEN_AI_MODELS_MAX_TOKEN_SIZES];
export const ENABLE_LOCAL_MODEL = false;
export const LOCAL_MODEL_URL = "http://localhost:11434/api/generate";
export const LOCAL_MODEL = "llama2";

export interface PluginSettings {
	/** Open AI Key */
	openAIApiKey: string;

	/** Open AI Model */
	openAIModel: string;

	/** Max Token Size in a Request */
	maxTokenSize: number;

	/** Minimum Summary Lines */
	summarySize: number;

	/** Template Format */
	templateFormat: string;

	/** Date Format */
	dateFormat: string;

	/** Enable Local Model */
	enableLocalModel: boolean;

	/** Local Model URL */
	localModelUrl: string;

	/** Local Model */
	localModel: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	openAIApiKey: "",
	openAIModel: DEFAULT_MODEL,
	maxTokenSize: DEFAULT_TOKEN_SIZE,
	summarySize: DEFAULT_SUMMARY_SIZE,
	templateFormat: DEFAULT_TEMPLATE,
	dateFormat: DEFAULT_DATE_FORMAT,
	enableLocalModel: ENABLE_LOCAL_MODEL,
	localModelUrl: LOCAL_MODEL_URL,
	localModel: LOCAL_MODEL
};
