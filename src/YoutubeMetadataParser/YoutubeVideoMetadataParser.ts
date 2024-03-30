import { DEFAULT_VIDEO } from "./Constants";
import { Notice, moment, request } from "obsidian";
import { YoutubeVideo, YoutubeVideoContent } from "./Models";
import { PluginSettings, YOUTUBE_BASE_URL } from "settings";

export class YoutubeMetadataParser {
	constructor(private settings: PluginSettings) { }

	async requestHTML(url: string) {
		try {
			let response = await request({ url: url, method: "GET" });
			let parser = new DOMParser();
			return parser.parseFromString(response, "text/html");
		} catch (reason) {
			new Notice("Error loading podcast: " + reason);
			return undefined;
		}
	}

	sanitizeString(str: string) {
		return str.replace(/[\-|\{|\}|:|,|\[|\]|\||\>|\<|\#|\"|\']/g, " ");
	}

	sanitizePodcast(video: YoutubeVideo) {
		video.title = this.sanitizeString(video.title);
		video.desc = this.sanitizeString(video.desc);
		video.showNotes = this.sanitizeString(video.showNotes);
		return video;
	}

	applyTemplate(video: YoutubeVideo): YoutubeVideoContent {
		video = this.sanitizePodcast(video);
		console.debug("template format", this.settings.templateFormat);
		let content = this.settings.templateFormat
			.replace(/{{Title}}/g, video.title)
			.replace(/{{ImageURL}}/g, video.imageLink)
			.replace(/{{Description}}/g, video.desc)
			.replace(/{{Date}}/g, video.date)
			.replace(/{{Timestamp}}/g, Date.now().toString())
			.replace(/{{VideoUrl}}/g, video.url)
			.replace(/{{ShowNotes}}/g, video.showNotes)
			.replace(/{{EpisodeDate}}/g, video.episodeDate);
		console.debug("updated content", content);
		return { title: video.title, content: content };
	}

	metaOG(root: Document, attribute: string, og: string) {
		let titleTag = root.querySelector(
			"meta[" + attribute + "='og:" + og + "']",
		);
		if (titleTag) {
			let title = titleTag.getAttribute("content");
			if (title) {
				return title;
			}
		}
		return "";
	}

	async loadVideo(root: Document, url: string): Promise<YoutubeVideo> {
		let podcast = DEFAULT_VIDEO;
		podcast.url = url;
		podcast.date = moment().format("YYYY-MM-DD");

		if (url.includes(YOUTUBE_BASE_URL)) {
			podcast.title =
				root.querySelector("title")?.innerText || "Title not found";
			podcast.desc =
				root
					.querySelector("#watch7-content > meta:nth-child(3)")
					?.getAttribute("content") || "";
			//desc = root.querySelector(".ytd-video-secondary-info-renderer").innerHTML;
			podcast.imageLink = this.metaOG(root, "property", "image");
		}

		// Obsidian mobile can only transclude images with https urls
		if (!podcast.imageLink.startsWith("https")) {
			podcast.imageLink = podcast.imageLink.replace("http", "https");
		}

		return podcast;
	}

	async getVideoNote(url: string): Promise<YoutubeVideoContent> {
		let root = await this.requestHTML(url);

		if (root) {
			let podcast = await this.loadVideo(root, url);
			let podcastNote = this.applyTemplate(podcast);
			return podcastNote;
		} else {
			return { title: "", content: "" };
		}
	}
}
