require('dotenv').config()
const request = require("request");
const pubsub = require("@google-cloud/pubsub");

let postWebHook = (req, res) => {
    let body = req.body;
    
    console.log("===============");
    console.log(body);
    console.log("===============");

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
    
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            let data = {"entry": webhook_event};
            handleMessage(webhook_event);
        });
    
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

let getWebHook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.FACEBOOK_WEB_ACCESS_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
        
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);      
        }
    }
};

// Handles messages events
async function handleMessage(received_data) {

    const dataBuffer = Buffer.from(JSON.stringify(received_data));

    const pubSubClient = new pubsub.PubSub({
        keyFilename: 'serviceAccountKey.json',
        projectId: process.env.GCP_PROJECT_ID
    });

    await pubSubClient.topic(process.env.GCP_PUBSUB_TOPIC).publish(dataBuffer);
};

module.exports = {
    postWebHook: postWebHook,
    getWebHook: getWebHook
};