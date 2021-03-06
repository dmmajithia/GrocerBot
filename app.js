var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var firebase = require("firebase");

var config = {
    apiKey: "AIzaSyAGOmtumitVr5RUdTVn5tFFN1nvH0DKA4U",
    authDomain: "grocerbot.firebaseapp.com",
    databaseURL: "https://grocerbot.firebaseio.com",
    projectId: "grocerbot",
    storageBucket: "",
    messagingSenderId: "416200240219"
  };
firebase.initializeApp(config);

var database = firebase.database();
var senderId;

var quickReplies = [
      				{
        				content_type:"text",
        				title:"Add",
        				payload:"add"
      				},
      				{	
      					content_type:"text",
      					title:"Show my groceries",
      					payload:"show-list"
      				},
      				/*{
      					content_type:"text",
      					title:"Buy",
      					payload:"shopping-list"
      				},*/
      				{
      					content_type:"text",
      					title:"Help",
      					payload:"help"
      				}
    				];

var bot = require("./bot");
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }
        else if (event.message) {
        	processMessage(event);
      	}
      });
    });

    res.sendStatus(200);
  }
});

function processMessage(event){
	if (!event.message.is_echo) {
    	var message = event.message;
    	var userID = event.sender.id;
    	//typing(userID);
    	// You may get a text or attachment but not both
    	console.log(message);
    	if (message.hasOwnProperty("quick_reply")) {
    		processQuickReply(userID, message.quick_reply.payload);
    		return;
    	}

    	 else if (message.text) {
      		var item = message.text.toLowerCase().trim();

      		database.ref("userData/"+userID).once('value').then(function(snapshot) {
  			var status = snapshot.val().status;
  			var count = snapshot.val().count;
  			if(status === "setup"){
  				count += 1;
  				database.ref("items/"+userID).child(count).set(item);
  				database.ref("userData/"+userID+"/count").set(count);
  				var returnMessage = {
  					text: count.toString() + ". " + item,
  					quick_replies:[
      				{
        				content_type:"text",
        				title:"Done",
        				payload:"setup-finish"
      				},
      				{
      					content_type:"text",
      					title:"Help",
      					payload:"help"
      				}
    				]
  				}
  				sendMessage(userID, returnMessage);
  			}
  			else if (status === "add"){
  				count += 1;
  				database.ref("items/"+userID).child(count).set(item);
  				database.ref("userData/"+userID+"/count").set(count);
  				var returnMessage = {
  					text: count.toString() + ". " + item,
  					quick_replies:[
      				{
        				content_type:"text",
        				title:"Done",
        				payload:"add-finish"
      				},
      				{
      					content_type:"text",
      					title:"Help",
      					payload:"help"
      				}
    				]
  				}
  				sendMessage(userID, returnMessage);
  			}
  			else if (status === "idle"){
  				console.log("PROCESS TEXT FROM HERE!!!!");
  				processText(userID, item, count);
  			}
		});
		}
	}
}

function processQuickReply(userID, payload){
	var message = {};
	database.ref("users/"+userID).once('value').then(function(snapshot) {
		var name = snapshot.val();
		switch (payload) {
			case "setup-finish":
				//change status to idle in database
				database.ref("userData/"+userID+"/status").set("idle");
				//send idle message
				message = {
					text: name + ", pat yourself for taking the first step towards healthy living!\nTo add or remove an item, type 'add/remove eggs'.\nNow, its time for some ice cream!",
					quick_replies: quickReplies
				}
				sendMessage(userID,message);
			break;
			case "show-list":
				database.ref("items/"+userID).once('value').then(function(snapshot) {
					var list = snapshot.val();
					var listText = "", i = 0;
					for(index in list){
						i += 1;
						listText += i.toString() + ". " + list[index] + "\n";
					}
					message = {
						text: listText,
						quick_replies:quickReplies
					}
					sendMessage(userID, message);
				});
			break;
			case "add":
				message = {
						text: "Type 'add salad, ...'",
						quick_replies:quickReplies
					}
					sendMessage(userID, message);
				//sendMessage(userID, bot.addMultiple(userID));
			break;
			case "add-finish":
				database.ref("userData/"+userID+"/status").set("idle");
				message = {
						text: "Gotcha " + name + " !",
						quick_replies:quickReplies
					}
					sendMessage(userID, message);
			break;
			case "help":
				var msg = "'add ramen, ...' to add new items\n'remove ramen, ...' to remove old items";
				sendMessage(userID, {text:msg, quick_replies: quickReplies });
			break;
			default:
		}
	});
}

function processPostback(event) {
  senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name,timezone"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        var zone = bodyObj.timezone;
        database.ref("timezones/"+zone+"/"+senderId).set(1);
        greeting = "Hi " + name + ". ";
      }
      database.ref("users/"+senderId).set(name);

      var message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: greeting + "My name is Grocer. I can keep track of your groceries - I will send you daily reminders of what is in your kitchen. What does your kitchen have today?",
                  buttons: [{
                      type: "postback",
                      title: "My kitchen has ...",
                      payload: "setup"
                    }/*, {
                      type: "postback",
                      title: "Make a Buy",
                      payload: "Buy"
                    }*/]
                }
              }
            };

      //var message = greeting + "My name is Grocer. I can keep track of your groceries - I will send you daily reminders of what is in your kitchen. What does your kitchen have today? Or should we start off with a grocery list?";
      sendMessage(senderId, message);
    });
  }

  else if (payload === "setup"){
  		sendMessage(senderId, bot.setup(senderId));
  }
}

function processText(userID, message, count) {
	console.log("PROCESS TEXT FROM 11111!!!!");
	// when status is idle
	console.log(message);
	if (message.indexOf("add") === 0){
		console.log("PROCESS TEXT FROM 22222!!!!");
		// add item/s
		message = message.replace("add", " ").trim();
		console.log(message);
		var list = message.split(',');
		if (!list[0]){
			sendMessage(userID, {text: "Type 'add salad, ...'", quick_replies: quickReplies});
			return;
		}
		console.log(list);
		var text = "";
		for (item in list){
			count += 1;
			database.ref("items/"+userID).child(count).set(list[item].trim());
			text += count.toString() + ". " + list[item].trim() + "\n";
		}
		database.ref("userData/"+userID+"/count").set(count);
		var msg = {
						text: text,
						quick_replies:quickReplies
				};
		sendMessage(userID, msg);

	}
	else if (message.indexOf("remove") === 0){
		console.log("PROCESS TEXT FROM 333333!!!!");
		// remove item
		message = message.replace("remove", "").trim();
		var list = message.split(",");
		if (!list[0]){
			sendMessage(userID, {text: "Type 'add remove, ...'", quick_replies: quickReplies});
			return;
		}
		database.ref("items/"+userID).once('value').then(function(snapshot) {
			message = message.replace("remove", "").trim();
			var list = message.split(",");
			var currentList = snapshot.val();
			for (item in list){
				if (isNaN(list[item])){
					// item is a string
					for (index in currentList){
						if (currentList[index] === list[item]){
							count -= 1;
							delete currentList[index];
						}
					}
				}
				else{
					if(currentList[list[item]]){
						// item is a number
						count -= 1;
						delete currentList[list[item]];
					}
				}
			}
			//now reorder the currentList
			var index = 0;
			var text = "";
			var newList = [];
			for (num in currentList){
				index += 1;
				newList[index] = currentList[num];
				text += index.toString() + ". " + currentList[num] + "\n";
			}
			database.ref("userData/"+userID+"/count").set(index);
			database.ref("items/"+userID).set(currentList);
			var msg = {
						text: text,
						quick_replies:quickReplies
				};
			sendMessage(userID, msg);
		});
	}
	else if (message.indexOf("buy") === 0){

	}

}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}
// send typing indicator
function typing(userID){
	request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: userID},
      sender_action: "typing_on",
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}