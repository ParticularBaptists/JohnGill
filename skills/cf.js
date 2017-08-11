var Botkit = require('botkit');
var request = require("request");
var striptags = require('striptags');
var lbcf2 = require("../data/2lbcf.json");

var confessions = {
  "2lbcf": lbcf2
}

var controller = Botkit.slackbot({
    debug: true
});

module.exports = function(controller) {

    // give the bot something to listen for.
    controller.hears(['cf', 'confession'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
        try {

            //split arguments
            var args = message.text.split(' ');

            //determine if input contains correct amount of arguments
            if (args.length != 3) {

                bot.reply(message, 'Sorry, did not understand your request: "' + message.text.toString() + '", Try help');
                return;
            }

            //bible version and passage
            var chosenConfession = args[1].toLowerCase();
          
            if (!chosenConfession in confessions) {
                bot.reply(message, "Sorry, we do not support your requested confession yet.")
            }
          
            var chosenChapterAndParagraph = args[2].toLowerCase();
          
            var chosenChapter = chosenChapterAndParagraph.split(".")[0]
            var chosenParagraph = chosenChapterAndParagraph.split(".")[1]
            
            //get data
            var title = confessions[chosenConfession]["chapters"][chosenChapter]["title"]
            var paragraph = confessions[chosenConfession]["chapters"][chosenChapter]["paragraphs"][chosenParagraph]

            //user
            var user = '<@' + message.user + '>';

            var reply = user + ", here you go" + "\n";
            var reply = reply + "Chapter " + chosenChapter + ": " + title + ". \nParagraph " + chosenParagraph + ": " + paragraph;
            bot.reply(message, reply);

        } catch (ex) {
            console.log("exception happened");
            console.log(ex);
            bot.reply(message, user + ", sorry - something went wrong - try again or try HELP")
        }

    });

}