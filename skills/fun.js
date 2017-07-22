var Botkit = require('botkit');

var controller = Botkit.slackbot({
    debug: true
});

module.exports = function(controller) {
  
  controller.hears("What", ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    console.log("in")
    if(message.toString().toLower() == "what is allan's favourite bible translation?") {
      console.log("test")
      bot.reply(message, "test");
      return;
      //TODO: finish this
    }
    
    
    bot.reply(message, 'Sorry, did not understand your request: "What is Allan\'s favourite bible translation?", Try help');
    
  });
  
}