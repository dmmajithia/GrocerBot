#!/usr/bin/env node

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

var message = {
	text: "Hello",
	quick_replies: quickReplies;
}
sendMessage('1409417202445673', message);





