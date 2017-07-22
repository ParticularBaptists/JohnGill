var Botkit = require('botkit');
var request = require("request");
var striptags = require('striptags');


var controller = Botkit.slackbot({
    debug: true
});

module.exports = function(controller) {

    // give the bot something to listen for.
    controller.hears('bible', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
        try {

            //split arguments
            var args = message.text.split(' ');


            //determine if input contains correct amount of arguments
            if (args.length != 3) {

                bot.reply(message, 'Sorry, did not understand your request: "' + message.text.toString() + '", Try help');
                return;
            }



            //bible version and passage
            var chosenBibleVersion = args[1].toLowerCase();
            var chapterAndVerse = args[2].toLowerCase();

            //user
            var user = '<@' + message.user + '>';


            //bible.org getRequest setup
            var username = "fJqmfC9dcG7wv1HfXfcQcMfJU77CH6XwUUfvCO09";
            var password = "X"; //the bibles.org api only needs a dummy api
            var url = "https://bibles.org/v2/passages.js?q[]=" + chapterAndVerse + "&version=eng-" + chosenBibleVersion.toUpperCase();
            var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

            console.log(url);

            //call bible api 
            request({
                    url: url,
                    timeout: 15000,
                    headers: {
                        "Authorization": auth
                    }
                },
                function(error, response, body) {


                    if (error) {
                        console.log('error request');
                        console.log(error.code);
                        if (error.code === 'ETIMEDOUT' || error.code === "ESOCKETTIMEDOUT") {
                            console.log('timeout');
                            bot.reply(message, user + ", sorry - seems like your request took too long. Try later, with a smaller passage or a different bible version.");
                            return;
                        }

                        console.log('error happend: ' + error.statusCode);
                        throw new "Something went wrong,  error code: " + error.code;

                    }

                    console.log("starting...");
                    var returnBible = JSON.parse(body);

                    //passage could not be found
                    if (returnBible.response.search.result.passages.length < 1) {
                        bot.reply(message, user + ', sorry - Holy Writ does not contain, "' + chapterAndVerse + '"');
                        return;
                    }

                    var thePassage = returnBible.response.search.result.passages[0].text;
                    var chapterAndVerseDisplay = returnBible.response.search.result.passages[0].display;
                    var version = returnBible.response.search.result.passages[0].version_abbreviation;

                    var reply = user + ", here you go" + "\n";
                    var reply = reply + '"' + cleanHtmlAndRemoveNonBiblicalText(thePassage + '" - ' + chapterAndVerseDisplay + ' (' + version + ')', [], " ");
                    bot.reply(message, reply);
                }
            );

        } catch (ex) {
            console.log("exception happened");
            console.log(ex);
            bot.reply(message, user + ", sorry - something went wrong - try again or try HELP")
        }

    });

    function cleanHtmlAndRemoveNonBiblicalText(passage) {
        //all this cleaning is necessary because the bible api I use only return passages with html tags - this is annoying.
        var cleaned = passage;
        //remove h3 tags and every character in between
        cleaned = cleaned.replace(/<h3.*h3>/, '');
        //remove all linebreaks
        cleaned = cleaned.replace(/\r?\n|\r/g, " ");
        //remove \u201c
        cleaned = cleaned.replace("\u201c", "");
        //strip all tags
        cleaned = striptags(cleaned, [], ' ');
        //remove multiple whitespaces 
        cleaned = cleaned.replace(/  +/g, ' ');
        //trim
        cleaned = cleaned.trim();
        return cleaned;
    }

}