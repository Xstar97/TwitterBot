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

client.stream('statuses/filter', { track: tag }, function (stream) {
  console.log("Searching for " + tag + " tweets...");

  // when a tweet is found
  stream.on('data', function (tweet) {
	
	if(tweet.user.screen_name != botName){
		console.log("\nFound a tweet!\n__________________________\n");
		console.log("User: " + tweet.user.screen_name);
		console.log("tweet says...\n", tweet.text + "\n");
		
		var message = getMsg();
		
		postReply(client, message, tweet);
		console.log("Replying with message: " + message);
		
		count+=1;
		console.log("message count: " + count);
		
		if(count == countMax)
		{
			console.log("meesage count max of " + countMax + ": " + count);
			console.log("shutting down for " + sleepTimer + " min(s)");
			sleep(sleepTimer*60000)
			count = 0;
			console.log("starting up again boy!");
		}
	}

    stream.on('error', function (error) {
      console.log(error);
    });
  });	
});
