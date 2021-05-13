const { auth, sleep, postReplyWithMedia, postReply  } = require('./config.js');
const client = auth();

//variables
var count = 0;
var countMax = 10;//sleeps once max count is hit.
var sleepTimer=3;//mins
var tag = "random word filter";//#noob
var botName = "userName";

const parameters = {
  track: tag,
  lang: 'en',
  locale: 'en'
};

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
	console.log("message count: " + count + "\n");
}

function sleeper(){
	try{
	if(count > countMax){
		console.log("meesage count max of " + countMax + ": " + count);
		console.log("shutting down for " + sleepTimer + " min(s)");
		//sleeps for x mins
		sleep.sleep(sleepTimer * 60);	
		count = 0;
		console.log("\nstarting up again!\n");
	}
	}catch(e){
		console.log("e: " + e);
	}
}


//Seaching a filtered stream of tweets
client.stream('statuses/filter', parameters, function (stream) {
	console.log("Searching for " + tag + " tweets...");
	// when a tweet is found
	stream.on('data', function (tweet) {
		
		try
		{
			//checking if tweet auther is not the bot or author
			var userName = tweet.user.screen_name != botName;
			var tweetData = tweet.text.includes(tag) && tweet.text != null;//tweet.text.length != 0 && tweet.text != null
			
			if(userName && tweetData)
			{
				if(count <= countMax)
				{
					//logging a tweet was found
					console.log("\nFound a tweet!\n__________________________\n");
					//user name and tweet
					console.log("User: " + tweet.user.screen_name + " tweeted: \n", tweet.text);
					
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
			}catch(e){
				console.log("E: " + e);
			}

    stream.on('error', function (error) {
      console.log(error);
    });
	
  });
  
});
