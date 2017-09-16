

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
//firebase.initializeApp(config);

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
// sends message to user
function sendMsg(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: 'EAABrBuy5oCUBANZAWC2dw73tc81mmPuZAt4wyYp1GCDo49qregdodrzol2FqLAloCJQbaBLrkPZANHp8YdiPZBEAU1cd3HZAs32hUVQD7oZAHx5kZBv9yv9oTGwMRW5OxZCFD4qtfjAUQ5vePS2XuKHc0ZB1DM149xSdU0q8BBK0nuAZDZD'},
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

exports.scheduler = function(){
	database.ref("users").once('value').then(function(snapshot){
		for(userID in snapshot.val()){
			name = snapshot.val()[userID];
			database.ref("items/"+userID).once('value').then(function(snap){

				var listText = "";
				//to be continued!

			});
		}
	});
}

database.ref("timezone")





