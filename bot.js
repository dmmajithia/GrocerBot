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
	databse.ref("userData/"+userID+"/status").set("add");
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

exports.processMessage = function(userID, message) {

	database.ref("userData/"+userID).once('value').then(function(snapshot) {
  		var status = snapshot.val().status;
  		var count = snapshot.val().count;
  		if(status === "setup"){
  			var item = message
  			count += 1;
  			database.ref("items/"+userID).child(count).set(item);
  			database.ref("userData/"+userID+"/count").set(count);
  			return {
  					text: count.toString() + ". " + item,
  					quick_replies:[
      				{
        				content_type:"text",
        				title:"Done",
        				payload:"setup-finish"
      				},
      				{	
      					content_type:"text",
      					title:"Show my groceries",
      					payload:"show-list"
      				},
      				{
      					content_type:"text",
      					title:"Help",
      					payload:"help"
      				}
    				]
  				}
  		}
	});
}