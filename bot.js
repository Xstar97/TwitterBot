const { auth, configData, fs, sleep, postReplyWithMedia, postReply  } = require('./config.js');
const client = auth();

//variables
var count = 0;//inital count
var params = configData.parameters;//param filter for stream
var botName = configData.botName;//user name of author or bot
var tag = params.track;//filtered text
var countMax = configData.countMax;//sleeps once max count is hit.
var sleepTimer = configData.sleepTimer;//X mins for sleep function
var mediaDir = configData.mediaDir;//media location
var msg = configData.msgs;//messages for victims

//polls the list for a random msg
function getMsg(){
	var mth1 = Math.floor(Math.random() * msg.length);
return msg[mth1];	
}

//polls the list for a random media
function getMedia(){
var media = fs.readdirSync(mediaDir);
var mth4 = Math.floor(Math.random() * media.length);
return mediaDir+media[mth4];	
}

//increments counter
function counterInc(){
	count+=1;
	console.log("message count: " + count + "\n");
}
//pauses thread after count spills over.
function sleeper(){
	try{
		console.log("meesage count max of " + countMax + ": " + count + "\n");
		console.log("shutting down for " + sleepTimer + " min(s)");
		//sleeps for x mins
		sleep.sleep(sleepTimer * 60);	
		count = 0;
		console.log("\nstarting up again boy!\n");	
	}catch(e){
		console.log("e: " + e);
	}
}

//Seaching a filtered stream of tweets
client.stream('statuses/filter', params, function (stream) {
	console.log("Searching for " + tag + " tweets...");
	// when a tweet is found
	stream.on('data', function (tweet) {
		try
		{
			//checking if tweet auther is not the bot or author
			var userName = tweet.user.screen_name != botName;
			var tweetData = tweet.text.includes(tag) && tweet.text != null;
			//tweet.text.length != 0 && tweet.text != null
			
			if(userName && tweetData)
			{
				if(count < countMax)
				{
					//logging a tweet was found
					console.log("\nFound a tweet!\n__________________________\n");
					//user name and tweet
					console.log("User: " + tweet.user.screen_name + " tweeted: \n", tweet.text);
					
					//our message
					var message = getMsg();
					var media = getMedia();
					
					////TODO uncomment the tweet option
			               //tweet the victim
			               //postReply(client, message, tweet);
			               //console.log("\nreplying with a txt\n");
			
			               //postReplyWithMedia(client, media, message, tweet);
			               //console.log("\nreplying with ANY media and txt\n");
					
					//incrementing counter
					counterInc();
					//incrementing counter
					counterInc();
				} else{
					//sleeper function
					sleeper();
				}
			}
			//end of the line
			}catch(e){
				console.log("E: " + e);
			}

    stream.on('error', function (error) {
      console.log(error);
    });
	
  });
  
});
