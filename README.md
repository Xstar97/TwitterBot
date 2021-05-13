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

4. copy the files from this repo into your project:
    - bot.js
    - config.js
    - data.json
    - create folder called "media"

5. edit data.json file
- add your keys
- botName
- dir for media
- parameters
- msgs

6. once you're done with everything its time to run the bot
- node bot.js
- your bot should start up and search for your filtered tweets and spam the masses :)

notes:
i am not repsonsible for what you do, intend to do, or fail to do. your choices are not my reponsibility.
have fun.
