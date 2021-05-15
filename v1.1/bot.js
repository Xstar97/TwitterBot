const { auth, configData, BotTimer, fs, postReplyWithMedia, postReply, postTweet } = require('./config.js');
const client = auth();

//variables
var params = configData.parameters;//param filter for stream
var botName = configData.botName;//user name of author or bot
var tag = params.track;//filtered text
var _mediaDir = configData.mediaDir;//media location
var defLang = configData.defaultLang;
var _msg = configData.msgList;//messages for victims
var ignoreList = configData.ignoreList;
var _botMsg = configData.botMsgList;
var delaybotAction = configData.botActionDelayInSeconds;
var delayMsgbotAction = configData.botMsgActionDelayInMinutes;


function randomNumber(list)
{
	return Math.floor(Math.random() * list);
}

function getListDataByLang(list, lang){
	var iList = list[lang];
	if(typeof iList === 'undefined') {
		iList = list[defLang];
	}
	return iList;
}

//polls the list for a random msg
function getMsg(lang){
	var mth1 = randomNumber(_msg.length);
	var msg  = _msg[mth1][lang];
	if(typeof msg === 'undefined') {
		msg = _msg[mth1][defLang];
	}
return msg;
}

//polls the list for a random media
function getMedia(lang){
var media = fs.readdirSync(getListDataByLang(_mediaDir, lang));
var dir = getListDataByLang(_mediaDir, lang);
var mth2 = randomNumber(media.length);
return dir + media[mth2];	
}

function getBotMsg(action){
	return getListDataByLang(action,defLang).replace('{TAG}', tag) + "\nbot says...\n" + getMsg(defLang);
}
const botAction = async (client, tweet) => {
	console.log("\nreplying with a funny tweet in " + delaybotAction.tweet + "s\n");
	await new Promise(resolve => {
		setTimeout(() => 
		{	
		//our message
		var message = getMsg(tweet.lang);
		var media = getMedia(tweet.lang);
		
		//tweeting victim
		postReplyWithMedia(client, media, message, tweet);
		console.log("\nreplying with random media and msg\n");
	}, delaybotAction.tweet*1000)
  })	
}

var minutesStale = delayMsgbotAction.stale, the_intervalStale = minutesStale * 60 * 1000;

function staleMsgBot(){
	console.log("stale bot:" + minutesStale + " minute check");
	getMsg(defLang);
		var tweet = getBotMsg(_botMsg.stale);
		console.log("tweet: " + tweet);
		postTweet(client, tweet);
}
var staleTimer = new BotTimer(function() {staleMsgBot()}, the_intervalStale);

function startMsgBot(){
	var startMsg = getBotMsg(_botMsg.start);
	postTweet(client, startMsg);
}

function startBot()
{
	startMsgBot();
	console.log("Starting stale time now...");
	staleTimer.start();
	//Seaching a filtered stream of tweets
	client.stream('statuses/filter', params, function (stream) {
		console.log("Searching for " + tag + " tweets...");
		
		// when a tweet is found
		stream.on('data', function (tweet) {
			//checking if tweet auther is not the bot or author
			var ignoreUser = ignoreList.includes(tweet.user.screen_name);
			var userName = tweet.user.screen_name != botName && !ignoreUser;
			
			if(ignoreUser){
				console.log("\nuser: " + tweet.user.screen_name + " is on the naughty list!\n");
			}

			var tweetData = tweet.text != null;
			if(userName && tweetData)
			{
				//logging a tweet was found
				console.log("\nFound a tweet!\n__________________________\n");
				//user name and tweet
				console.log("User: " + tweet.user.screen_name + " tweeted: \n", tweet.text);
				//botAction
				botAction(client, tweet);
				//reset stale timer
				staleTimer.reset(the_intervalStale);
			}
			//end of the line
			
			stream.on('error', function (error) {
				console.log(error);
			});
		});
	});
}
startBot();
