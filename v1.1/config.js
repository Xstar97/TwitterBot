const Twitter = require('twitter');
const fs = require('fs');
const Promise = require('bluebird')
const data = require("./data.json");
let rawdata = fs.readFileSync('./data.json');
let configData = JSON.parse(rawdata);

// auth methods
const auth = () => {
   let keys  = configData.keys;
   var client = new Twitter(keys);
    return client;
}

function supportedMedia(mediaFilePath){
	var mediaType = "";
	if(mediaFilePath.endsWith(".mp4")){
		mediaType = "video/mp4";
	}else if(mediaFilePath.endsWith(".mov")){
		mediaType = "video/mov";
	}else if(mediaFilePath.endsWith(".png")){
		mediaType = "image/png";
	}else if(mediaFilePath.endsWith(".jpg")){
		mediaType = "image/jpg";
	}else if(mediaFilePath.endsWith(".jpeg")){
		mediaType = "image/jpeg";
	}else if(mediaFilePath.endsWith(".gif")){
		mediaType = "image/gif";
	}
	return mediaType;
}

// media upload methods
const initMediaUpload = (client, mediaFilePath) => {
	var mediaType = supportedMedia(mediaFilePath);
    const mediaSize = fs.statSync(mediaFilePath).size
    return new Promise((resolve, reject) => {
        client.post("media/upload", {
            command: "INIT",
            total_bytes: mediaSize,
            media_type: mediaType
        }, (error, data, response) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(data.media_id_string)
            }
        })
    })
}

const appendMedia = (client, mediaId, mediaFilePath) => {
    const mediaData = fs.readFileSync(mediaFilePath)
    return new Promise((resolve, reject) => {
        client.post("media/upload", {
            command: "APPEND",
            media_id: mediaId,
            media: mediaData,
            segment_index: 0
        }, (error, data, response) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(mediaId)
            }
        })
    })
}

const finalizeMediaUpload = (client, mediaId) => {
    return new Promise((resolve, reject) =>  {
        client.post("media/upload", {
            command: "FINALIZE",
            media_id: mediaId
        }, (error, data, response) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(mediaId)
            }
        })
    })
}

//all media
const postReplyWithMedia = (client, mediaFilePath, message, replyTweet) => {
	if(supportedMedia(mediaFilePath) != "")
	{
		initMediaUpload(client, mediaFilePath)
		.then((mediaId) => appendMedia(client, mediaId, mediaFilePath))
        .then((mediaId) => finalizeMediaUpload(client, mediaId))
        .then((mediaId) => {
            let obj = {
                status: "@" + replyTweet.user.screen_name + " " + message,
                in_reply_to_status_id: replyTweet.id_str,
                media_ids: mediaId
            }
			_postReply(client, obj);
			console.log("\nmedia used: " + mediaFilePath + "\n");
		});		
	}else 
	{
		console.log("media not supported!");
		postReply(client, message, replyTweet);
	}
}

const postReply = (client, message, replyTweet) => {
	let obj = {
        status: "@" + replyTweet.user.screen_name + " " + message,
        in_reply_to_status_id: replyTweet.id_str
    }
	_postReply(client, obj);
}

const postTweet = (client, message) => {
    
	let obj = {
        status: message,
    }
	// tweet
	_postTweet(client, obj);
}

const postReTweet = (client, message, reTweet) => {
    
	let obj = {
        status: message,
        id: reTweet.id_str
    }
	// Retweet a tweet using its id_str attribute
	_postReTweet(client, obj);
}

const postLike = (client, likeTweet) => {
	
	let obj = {
        id: likeTweet.id_str
    }
	// Like a tweet /w id
	_postLike(client, obj);
}

const postFollowUser = (client, twit) => {
	
	let obj = {
        screen_name: twit.user.screen_name
    }
	// Follow a user using screen_name
	_postFollowUser(client, obj);
}

//init methods
const _postReply = (client, obj) => 
{	
client.post('statuses/update', obj)
.then(function (tweet) {
	console.log("\ntweeted: " + tweet.text + "\n");
	}).catch(function (error) {
		console.log(error);
	});
}

const _postTweet = (client, obj) => {
	// tweet
	client.post('statuses/update', obj)
	.then(tweet => {
		console.log('\ntweeted: ' + tweet.text);
	}).catch(console.error);
}

const _postReTweet = (client, obj) => {
	// Retweet a tweet using its id_str attribute
	client.post('statuses/retweet', obj)
	.then(retweet => {
		console.log('user: @' + retweet.user.screen_name);
		console.log('\nRetweeted: ' + retweet.text);
		console.log('\nbot tweeted: ' + retweet.text);
	}).catch(console.error);
}

const _postLike = (client, obj) => {
	
	// Like a tweet /w id
	client.post('favorites/create', obj)
	.then(likeTweet => {
		console.log('user: @' + likeTweet.user.screen_name);
		console.log('\ntweeted: ' + likeTweet.text);
		console.log('\nLiked tweet successfully!\n');
		}).catch(console.error);
}

const _postFollowUser = (client, obj) => {
	// Follow a user using screen_name
	client.post('friendships/create', obj)
    .then(tweet => {
		console.log('\nFollowed ' + tweet.user.screen_name + ' successfully!\n');
		}).catch(console.error);
}

function BotTimer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
}

module.exports = { auth, configData, BotTimer, fs, postReplyWithMedia, postReply, postTweet };
