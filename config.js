const Twitter = require('twitter');
const fs = require('fs');
const Promise = require('bluebird')
const dotenv = require("dotenv")
const sleep = require('sleep');
dotenv.config()

// auth methods
const auth = () => {
    let secret = {
        consumer_key: process.env.API_KEY,
        consumer_secret: process.env.SECRET_KEY,
        access_token_key: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET//,
		//request_options: 
		//{
		//	proxy: 'http://myproxyserver.com:1234'
		//}
    }

    var client = new Twitter(secret);
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
            let statusObj = {
                status: "@" + replyTweet.user.screen_name + " " + message,
                in_reply_to_status_id: replyTweet.id_str,
                media_ids: mediaId
            }
            client.post('statuses/update', statusObj,  function(error, tweet, response) {	
                //if we get an error print it out
                if (error) {
                    console.log(error);
                }

                //print the text of the tweet we sent out
                console.log("replied: " + tweet.text);
				console.log("\nmedia used: " + mediaFilePath + "\n");
				});
		//
		});		
	}else 
	{
		console.log("media not supported!");
	}
}

const postReply = (client, message, replyTweet) => {
    
	let statusObj = {
        status: "@" + replyTweet.user.screen_name + " " + message,
        in_reply_to_status_id: replyTweet.id_str
    }
	
	client.post('statuses/update', statusObj)
	.then(function (tweet) {
		console.log("\ntweeted: user @" + tweet.user.screen_name + "\n" + tweet.text + "\n");
		})
		.catch(function (error) {
			console.log(error);
		});
}

const postTweet = (client, message) => {
    
	let obj = {
        status: message,
    }
	// tweet
	client.post('statuses/update', statusObj)
	.then(tweet => {
		console.log('\ntweeted: ' + tweet.text);
		console.log('\ntweeted successfully!\n');
	}).catch(console.error);
}

const postReTweet = (client, message, reTweet) => {
    
	let obj = {
        status: message,
        id: reTweet.id_str
    }
	// Retweet a tweet using its id_str attribute
	client.post('statuses/retweet', obj)
	.then(result => {
		console.log('user: @' + reTweet.user.screen_name);
		console.log('\ntweeted: ' + reTweet.text);
		console.log('\nRetweeted successfully!\n');
	}).catch(console.error);
}

const postLike = (client, message, likeTweet) => {
	
	let obj = {
        id: likeTweet.id_str
    }
	// Like a tweet /w id
	client.post('favorites/create', obj)
	.then(result => {
		console.log('user: @' + likeTweet.user.screen_name);
		console.log('\ntweeted: ' + likeTweet.text);
		console.log('\nLiked tweet successfully!\n');
		}).catch(console.error);
}

const postFollowUser = (client, message, twit) => {
	
	let obj = {
        screen_name: twit.screen_name
    }
	// Follow a user using screen_name
	client.post('friendships/create', obj)
    .then(result => {
		console.log('\nFollowed ' + twit.user.screen_name + ' successfully!\n');
		}).catch(console.error);
}

module.exports = { auth, sleep, postReplyWithMedia, postReply };
