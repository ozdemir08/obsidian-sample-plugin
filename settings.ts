/** Constants */
export const YOUTUBE_BASE_URL = "youtube.com";
export const DEFAULT_TEMPLATE = "---\ndate: {{Date}}\n---\n# {{Title}}\n![]({{ImageURL}})\n## Description:\n{{Description}}\n-> [Youtube video Link]({{PodcastURL}})\n\n## Summary:\n";
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_SUMMARY_SIZE = 3;
export const MAX_SUMMARY_SIZE = 20;
export const MAX_TOKEN_SIZE_IN_A_REQUEST = 2500;

export interface PluginSettings {
	/** Open API Key */
	openAIApiKey: string;
	
	/** Minimum Summary Lines */
	summarySize: number;

    /** Max Token Size in a Request */
    maxTokenSize: number;
	
	/** Template Format */
	templateFormat: string;
	
    /** Date Format */
	dateFormat: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    openAIApiKey: "",
	summarySize: DEFAULT_SUMMARY_SIZE,
    maxTokenSize: MAX_TOKEN_SIZE_IN_A_REQUEST,
	templateFormat: DEFAULT_TEMPLATE,
	dateFormat: DEFAULT_DATE_FORMAT
};
