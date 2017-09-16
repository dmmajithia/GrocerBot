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

exports.setup = function(userID) {
	//first add state to data
	database.ref("userData/"+userID+"/status/").set("setup");
	database.ref("userData/"+userID+"/count/").set(0);
	database.ref("items/"+userID).set();
	return {
			text: "Tell me what groceries are in your kitchen",
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
}

exports.addMultiple = function(userID) {
	database.ref("userData/"+userID+"/status").set("add");
	return {
			text: "Tell me what groceries are in your kitchen, one item at a time",
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
}

exports.processMessage = function(userID, message, count) {

	// when status is idle
	if (message.indexOf("add") === 1){
		// add item/s
		message = message.replace("add", "").trim();
		var list = message.split(",");
		var text = "";
		for (item in list){
			count += 1;
			database.ref("items/"+userID).child(count).set(item);
			text += count.toString() + ". " + item + "\n";
		}
		database.ref("userData/"+userID+"/count").set(count);
		return text;

	}
	else if (message.indexOf("remove") === 1){
		// remove item
		database.ref("items/"+userID).once('value').then(function(snapshot) {
			message = message.replace("add", "").trim();
		var list = message.split(",");
		});
	}

}