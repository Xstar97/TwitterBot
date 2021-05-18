const { auth, configData, BotTimer, fs, postReplyWithMedia, postReply, postTweet } = require('./config.js');
const Path = require("path");
const client = auth();
process.stdin.resume();//so the program will not close instantly
const exit_time_seconds = 5;

function exitHandler(options, exitCode) {
	if (options.cleanup) console.log("cleanup");
	if (exitCode || exitCode === 0) console.log(exitCode);
	if (options.exit) {
		endMsgBot();
		setTimeout(function () {
			process.exit()
		}, exit_time_seconds * 1000);
	};
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

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

var mediaShuffle = configData.canShuffleMediaList;
var msgShuffle = configData.canShuffleMsgList;

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function randomNumber(list) {
	return Math.floor(Math.random() * list);
}

function getListDataByLang(list, lang) {
	var iList = list[lang];
	if (typeof iList === 'undefined') {
		iList = list[defLang];
	}
	return iList;
}

function ThroughDirectory(Directory) {
	let Files = [];
	fs.readdirSync(Directory).forEach(File => {
		const Absolute = Path.join(Directory, File);
		if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
		else return Files.push(Absolute);
	});
	return Files;
}

//polls the list for a random msg
function getMsg(lang) {
	var mth1 = randomNumber(_msg.length);
	var msg = _msg[mth1][lang];
	if (typeof msg === 'undefined') {
		msg = _msg[mth1][defLang];
	}
	if (msgShuffle) {
		msg = shuffle(msg);
		console.log("\nmsg list shuffled!\n");
	}
	return msg;
}

//polls the list for a random media
function getMedia(lang) {
	var media = ThroughDirectory(getListDataByLang(_mediaDir, lang));
	if (mediaShuffle) {
		media = shuffle(media);
		console.log("\nmedia list shuffled!\n");
	}

	var mth2 = randomNumber(media.length);
	var randomMedia = media[mth2];
	return randomMedia;
}

function getBotMsg(action) {
	var msg = `${getListDataByLang(action, defLang).replace('{TAG}', tag)}\nbot says...\n${getMsg(defLang)}`;
	return msg;
}
//fire off a reply with media
const botAction = async (client, tweet) => {
	console.log(`\nreplying with a funny tweet in ${delaybotAction.tweet}s\n`);
	await new Promise(resolve => {
		setTimeout(() => {
			//our message
			var message = getMsg(tweet.lang);
			var media = getMedia(tweet.lang);

			//tweeting victim
			postReplyWithMedia(client, media, message, tweet);
			console.log(`\nreplying with a random:\nmedia: ${media}\nmsg ${message}`);
		}, delaybotAction.tweet * 1000)
	})
}

function startMsgBot() {
	var startMsg = getBotMsg(_botMsg.start);
	postTweet(client, startMsg);
}

var minutesStale = delayMsgbotAction.stale, the_intervalStale = minutesStale * 60 * 1000;
var staleCounter = 0;
/*
stale message timer
*/
function staleMsgBot() {
	console.log(`stale bot: ${minutesStale} minute check`);
	getMsg(defLang);
	var tweet = getBotMsg(_botMsg.stale);
	console.log(`tweet: ${tweet}`);
	postTweet(client, tweet);
	staleCounter += 1;
	if (staleCounter == 5) {
		staleTimer.stop();
	}
}
var staleTimer = new BotTimer(function () { staleMsgBot() }, the_intervalStale);

const endMsgBot = async () => {
	console.log("end of life");
	var tweet = getBotMsg(_botMsg.end);
	console.log(`tweet: ${tweet}`);
	postTweet(client, tweet);
}


function startBot() {
	console.log("Starting bot, sending a tweet to the masses...");
	startMsgBot();
	console.log("Starting stale time now...");
	staleTimer.start();

	//Seaching a filtered stream of tweets
	client.stream('statuses/filter', params, function (stream) {
		console.log(`Searching for ${tag} tweets...`);

		// when a tweet is found
		stream.on('data', function (tweet) {
			var user = tweet.user.screen_name;
			var status = tweet.text;
			//checking if tweet auther is not the bot or author
			var ignoreUser = ignoreList.includes(user);
			var userNames = user != botName && !ignoreUser;

			if (ignoreUser) {
				console.log(`\nuser: ${user} is on the naughty list!\n`);
			}

			var tweetData = status != null && status.includes(tag) && tweet.retweeted_status == null;
			if (userNames && tweetData) {
				//logging a tweet was found
				console.log("\nFound a tweet!\n__________________________\n");
				//user name and tweet
				console.log(`User: ${user} tweeted: ${status}`);
				//botAction
				botAction(client, tweet);
				//reset stale timer
				if (staleCounter != 5) {
					staleTimer.reset(the_intervalStale);
				}
			}
			//end of the line

			stream.on('error', function (error) {
				console.log(error);
			});
		});
	});
}
startBot();
