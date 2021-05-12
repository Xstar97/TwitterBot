# TwitterBot
nodejs twitter bot

1. download nodejs -> https://nodejs.org/en/download/

2. go to twitter developer portal -> https://developer.twitter.com/apply-for-access.html
- apply for a developer account(easy and instant)
- create a standalone app in the portal
- save your api key and secret for later.
- change app permissions from read only TO read + write
- go to keys and token and generate YOUR user key and secret w/ writes permissions
- it should say Created with Read and Write permissions after generating keys

3. create a dir for your bot and then npm init inside it
- go through the steps for the project....
    - npm install twitter dotenv bluebird sleep --save

4. create these files and copy and paste the data from this repo:
    - bot.js
    - config.js
    - .env

5. edit .env file place your keys and secrets in order
- api key and secret the first two slots
- user key and secret the last two slots

6. edit bot.js
    - var countMax = 6;//max messages sent in a given time
    - var sleepTimer=2//this is to make the bot sleep for X min(s)
    - var tag = "#word";//filter for twitter stream
    - var botName = "twitterUserName";//requried if you dont want spam yourself if you use the filtered word/or #
    - let msg = 
    [
    'message 1',
    'message 2',
    'message 3',
    'there\'s another message here'
    ]//randomly selected messages to be used in the reply

- dont make the variable countMax too high or your bot will be considered spam if it messages are too much, keep it under 25 or better 10
-  once the reply message counter has reached its max, it will sleep for X mins and then auto  start again
-  filter a specific word or # and you will comment a random phrase from msg array
-  msg array can be infinite...or just 1
-  if you use ' in your message, you have to add a \ before it. ex "there\'s" in order to make the sentence whole.

7. once you're done with everything its time to run the bot
- run your bot:
- node bot.js
- your bot should start up and search for your filtered tweets and spam the masses :)

notes:
i am not repsonsible for what you do, intend to do, or fail to do. your choices are not my reponsibility.
have fun.
