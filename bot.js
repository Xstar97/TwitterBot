const { auth, postReplyWithMedia, postReply  } = require('./config.js');

const client = auth();
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
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

//Seaching a filtered stream of tweets
client.stream('statuses/filter', { track: tag }, function (stream) {
	console.log("Searching for " + tag + " tweets...");
	// when a tweet is found
	stream.on('data', function (tweet) {
		
		//checking if tweet auther is not the bot or author
		if(tweet.user.screen_name != botName){
			if(tweet.text.length != 0 || tweet.text != null){
				//logging a tweet was found
				console.log("\nFound a tweet!\n__________________________\n");
				//user name
				console.log("User: " + tweet.user.screen_name);
				//user's tweet
				console.log("tweet says...\n", tweet.text);
				//our message
				var message = getMsg();
				//tweeting victim
				postReply(client, message, tweet);
				
				//incrementing counter
				count+=1;
				console.log("\nmessage count: " + count + "\n");
				
				//sleeper function
				if(count == countMax)
				{
					console.log("meesage count max of " + countMax + ": " + count);
					console.log("shutting down for " + sleepTimer + " min(s)");
					//sleeps for x mins
					sleep(sleepTimer*60000);
					//resets counter
					count = 0;
					console.log("starting up again boy!");
				}
		}
		//end of the line
	}

    stream.on('error', function (error) {
      console.log(error);
    });
	
  });
  
});
