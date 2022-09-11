
const {Expo} = require('expo-server-sdk');
const solacePNService = (pushTokens) => {
// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security

  // const credentials = { accessToken: process.env.EXPO_ACCESS_TOKEN };
  const expo = new Expo();

  // Create the messages that you want to send to clients
  const messages = [];


  // const somePushTokens = await getPushTokens();
  // console.log( somePushTokens );
  // console.log( expo );


  for (const [key, value] of pushTokens.entries()) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(key)) {
      console.error(`Push token ${key} is not a valid Expo push token`);
      continue;
    }


    messages.push({
      to: key,
      sound: 'default',
      body: 'This is a test notification',
      data: value,
    });
  }


  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = solacePNService;
