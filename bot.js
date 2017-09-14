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

exports.setup = function(userID) {
	//first add state to data
	database.ref("status/"+userID).set("setup");
	return {
			text: "Tell me what groceries are in your kitchen",
			quick_replies:[
      		{
        		content_type:"text",
        		title:"That is all in my kitchen",
        		payload:"setup-finish"
      		}
    		]
		}
}