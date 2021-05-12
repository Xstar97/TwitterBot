const { auth, sleep, postReplyWithMedia, postReplyWithImg, postReply  } = require('./config.js');
const client = auth();

//variables
var count = 0;
var countMax = 10;//sleeps once max count is hit.
var sleepTimer=3;//mins
var tag = "random word filter";//#noob
var botName = "userName";
let msg = 
[
'Random message 1',
'Random message 2',
'Random message 3'
]

function getMsg(){
	var mth = Math.floor(Math.random() * msg.length);
return msg[mth];	
}

function counterInc(){
	count+=1;
	console.log("\nmessage count: " + count + "\n");
}

function sleeper(){
	try{
	if(count > countMax){
		console.log("meesage count max of " + countMax + ": " + count);
		console.log("shutting down for " + sleepTimer + " min(s)");
		//sleeps for x mins
		sleep.sleep(sleepTimer * 60);	
		count = 0;
		console.log("starting up again!");
	}
	}catch(e){
		console.log("e: " + e);
	}
}


//Seaching a filtered stream of tweets
client.stream('statuses/filter', { track: tag }, function (stream) {
	console.log("Searching for " + tag + " tweets...");
	// when a tweet is found
	stream.on('data', function (tweet) {
		
		//checking if tweet auther is not the bot or author
		if(tweet.user.screen_name != botName)
		{
			
			if(tweet.text.length != 0 || tweet.text != null && count <= countMax)
			{
			//logging a tweet was found
			console.log("\nFound a tweet!\n__________________________\n");
			//user name
			console.log("User: " + tweet.user.screen_name);
			//user's tweet
			console.log("tweet says...\n", tweet.text);
			
			//our message
			var message = getMsg();
			
			//TODO uncomment the tweet option
			//tweet the victim
			//postReply(client, message, tweet);
			//console.log("\nreplying with a txt\n");
			
			//postReplyWithImg(client, "./img.png", message, tweet);
			//console.log("\nreplying with a image and txt\n");
				
		        //postReplyWithMedia(client, "./animGif.gif", message, tweet);
			//console.log("\nreplying with a gif and txt\n");
			
		        //postReplyWithMedia(client, "./video.mp4", message, tweet);
			//console.log("\nreplying with a vid and txt\n");
			
			//incrementing counter
			counterInc();
			
			//sleeper function
			sleeper();
			}
		}
		//end of the line

    stream.on('error', function (error) {
      console.log(error);
    });
	
  });
  
});
