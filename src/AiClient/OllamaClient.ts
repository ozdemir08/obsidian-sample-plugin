import { request } from "obsidian";
import { AiClient } from "src/AiClient/AiClient";

import { PluginSettings, LOCAL_MODEL_URL, LOCAL_MODEL } from "settings";

export class OllamaClient implements AiClient {
	url: string;
	model: string;

	constructor(settings: PluginSettings) {
		this.model = settings.enableLocalModel ? settings.localModel : LOCAL_MODEL;
		this.url = settings.enableLocalModel ? settings.localModelUrl : LOCAL_MODEL_URL;
	}
 
	async query(content: string): Promise<string> {
		console.debug("Querying Ollama with content: ", content);
		console.debug("Model: ", this.model);
		try {
			const chatCompletion = await request({ 
				url: this.url, 
				method: "POST",
				contentType: "application/json",
				body: JSON.stringify({
					"model": this.model,
					"prompt": content,
					"stream": false,				
				})
			});
			console.debug("chatCompletion", chatCompletion);
			return chatCompletion; // Directly return the awaited result
		} catch (error) {
			console.error("Error querying Ollama", error);
			throw new Error("Error querying Ollama"); // Throw an error to be caught by the caller
		}
	}
}

/*
curl http://localhost:11434/api/generate -d '
{
	"model": "llama2",
	"prompt": "Below is a transcript of a Youtube video. Can you give me 6 key points and return the results as an unordered markdown list? \n\t---\nin this video we're going to go over lazy loading for single spawn micro front-ends lazy loading is a strategy for improving the performance of your application by only downloading the code that you need up front and downloading other code later as you navigate around in the application in single spa there are actually two different places where you can do lazy loading in your code and also there are two different methods for doing lazy loading the two places in your code where you can do lazy loading or either in your route config like we're looking at here or within the individual applications themselves the two different methods for doing lazy loading are either with system j/s your module loader or with web pack slash roll up your bundler okay so let's talk about the places in which you can do lazy loading here in the route config you do lazy loading with your loading function the loading function is the second argument to the register application API and you provide a function that returns a promise in this case we're using system dot import with system J s lazy loading the code for react MF planets will not be downloaded until system import is called and system dot import won't be called until the activity function which is here on line 19 indicates that the planets micro front-end should be active if we look at the actual UI here notice that we're currently looking at the people when I click on the planets link up here we're going to see a network request to download that code here it is so that's what lazy loading is and this is doing a route based lazy loading within the route config route based because um we went to a different URL and so now we have down the new code this is something that's built into single spa with these loading functions okay so now let's talk about lazy loading within your application so I'm going to switch now from being inside of the root config repo to being in a different repo this is now the code for people this is the people application so lazy loading within your application is always a bit more framework specific in this case we're looking at a react application but similar concepts apply for view and for angular specifically the web pack stuff and that the web pack roll-up stuff applies regardless of whether you're using react or view or angular so the way that you do code splitting with web pack and roll-up you call import as a function in this case our goal is to take this home world component we're gonna comment it out and instead we're going to lazy load it once we lazy load it it will then be rendered here on line 43 okay so to do this in react we're going to use the react lazy function and provided our dynamic import here that will download the home world component when I save this file we'll notice that in the output the webpack output it will say that there are actually be a whole new JavaScript file created the react time of people currently contains the home world component it will be taken out of the reactive people file and it will be put into its own files let me save it here we are so notice that there are now two different JavaScript files whereas before there was only one so this is how you do application based lazy loading let's verify that it works so when I go back to the people application or refresh the page here when I click on any one of these people will notice that we're now downloading the 0 dot reactant of people dot J's file that's the file that has the homeworld component and we can see here that homeworld Tatooine is actually showing so it is working you can configure the name of these files in both web pack and roll-up you can do it in the web pack config or you can do it right here inside of your code with a special comment I think I'll have to restart the web pack dev server in order for the name to change there it is so you can you can control the name of these files okay so we've now shown both how to do lazy loading in the route config and within the application and we've talked about how to do it with system J s and with web pack and now one thing to keep in mind is that you can mix and match those however you'd like so you can do web pack lazy loading which is just the dynamic import it's not system imports just import this is web pack lazy loading and you can do this inside of the root config or inside of the applications similarly you can do system dot important side of the route config or inside of the applications the pattern that I often follow is that I'll do system dot import between the applications and within the route config but I'll do just normal dynamic import within web pack for code splitting within an application however you can choose whichever one you'd like the idea here is that you want to only download the code that you need to for like the immediate present you don't need to download any code that is not needed right now to end I just want to give a word of caution so code splitting and lazy loading like this can actually be a detriment to your performance if you take it too far so a hundred Network requests is not better than five or even two or even one sometimes so you need to actually measure the performance of your application if you're going to get serious about making it better one pattern that I like to follow is to do route based code splitting but I don't usually do code splitting much beyond that this is why using the code splitting in the single spot route config where we're calling register application it's really nice and convenient just to do a little code split right here because this is always a route based code split and the nice thing about route based code splits is that you know when they're going to be downloaded the user has to navigate around they have to click on a link they have to go somewhere within the application in order to see it and so I'd recommend sticking to route based code splitting either just with the register application calls or or even within the application itself do route based code splitting stick to that at first and then add in other code splits if needed later",
	"stream": false
}'
*/