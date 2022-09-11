

const SOLACE_CONFIG = require('../utils/solace_config');
const Transaction = require('mongoose-transactions');
const { cleanPhoneNumber } = require('../utils/helper');
const transaction = new Transaction();

/**
 * Class to represent the trigger service
 *
 * @class
 */
class TriggerService {
  /**
   *
   * @access private
   * @param {object} triggerResourceParams -- triggerResourceParams
   * @returns {object} -- object
   */
  static async #createPanicAlertFactory(triggerResourceParams) {
    const {requestBody, models, dependencies} = triggerResourceParams;
    const {Trigger} = models;
    const {Geolocation, Dao} = dependencies;
    let {email, location, batteryDetails, triggerId} = requestBody;

    const geolocation = new Geolocation();



    try {
      if ( triggerId === '' || triggerId === undefined ) triggerId= transaction.insert( 'Trigger', {email: email, safety_status: 0, instances: []});


      const instanceId = transaction.insert( 'Instance', {email: email, trigger_id: triggerId});
      let triggerInstances = await Dao.get( Trigger, {_id: triggerId} );


      if ( triggerInstances.length === 0 ) triggerInstances.push(instanceId.toString());
      else {
        triggerInstances = triggerInstances[0].instances;
        triggerInstances.push(instanceId.toString());
      }


      const updateInstancesBody = {instances: triggerInstances};

      transaction.update('Trigger', triggerId, updateInstancesBody);


      const batteryId = transaction.insert( 'Battery', {email: email, battery_details: batteryDetails, instance_id: instanceId, trigger_id: triggerId} );
      const locationId = transaction.insert( 'Location', {email: email, location: location, trigger_id: triggerId, instance_id: instanceId, battery_id: batteryId, reverse_geodata: ''});


      const resolveStatus = await geolocation.resolveGeoLocation(location);
      if ( resolveStatus === false ) return {message: 'There was an error in resolving the geo location data. ', status: false};


      const updateData = {reverse_geodata: resolveStatus};
      transaction.update( 'Location', locationId, updateData );


      const final = await transaction.run();
      transaction.clean(); // clean the transactionn after every run. 


      if ( final ) return {message: 'message sent successfully ', triggerId: triggerId.toString(), status: true};
    } catch (error) {
      console.error(error);
      await transaction.rollback().catch(console.error);
      transaction.clean();
      return {message: error.message, status: false};
    }

    return {message: 'error in sending trigger ', status: false};
  }
  /**
   *
   * @param {object} triggerResourceParams -- triggerResouceParams
   * @returns {object} -- object
   */
  static async createPanicAlertResource( triggerResourceParams ) {
    const {message, status, triggerId} = await TriggerService.#createPanicAlertFactory(triggerResourceParams);

    if ( status === false) return {message: message, status: status};

    const {requestBody, models, dependencies} = triggerResourceParams;
    const {User, Contact, IncidentOptions} = models;
    const {Dao, Notification} = dependencies;
    const {email} = requestBody;


    try {
      const user = await Dao.get(User, {email: email} );
      const contacts = await Dao.get(Contact, {email: email} );
      const incidents = await Dao.get(IncidentOptions);


      if ( user.length === 0 ) return {message: 'user does not exist ', status: 'not_sent'};
      if ( contacts.length === 0 ) return {message: 'it looks like you do not have an emergency  ', status: 'not_sent'};

      const contactList = contacts[0].contacts;
      if ( contactList.length === 0 ) return {message: 'There is no emergency contact to send it to', status: 'not_sent', noContact: true};


      const {fname} = user[0];
      const frspName = contacts[0].contacts[0].name;


      let frspPhone = contacts[0].contacts[0].phoneNumbers[0].number;
      frspPhone = frspPhone.replace(/\s/g, '');

      
      frspPhone = cleanPhoneNumber(frspPhone);

      // if ( frspPhone.indexOf('+') > -1 ) frspPhone = frspPhone.slice(1, frspPhone.length);


      const outBoundMessage = `[Solace] Hi ${frspName}, Your friend ${fname} seems to be unsafe. Click the link below to see their location.:  ${SOLACE_CONFIG.SOLACE_DOMAIN}/emergency/${triggerId} `;
      const sendTriggerMessage = await new Notification().sendOTPCode( {message: outBoundMessage, phone: frspPhone, event: 'trigger'} );


      if ( sendTriggerMessage['status'] === false ) return {message: sendTriggerMessage['message'], status: 'not sent'};


      return {message: 'panic alert has been triggered successfully. ', status: 'sent', trigger_id: triggerId, incidents: incidents};
    } catch (e) {
      return {message: e.message, status: 'not sent'};
    }

  }
  /**
   *
   * @param {object} triggerResourceParams -- triggerResourceParams
   * @returns {object} -- returns object based on action
   */
  static async createPanicInstanceResource(triggerResourceParams) {
    const {message, status} = await TriggerService.#createPanicAlertFactory(triggerResourceParams);
    if ( status === false ) return {message: message, status: status};
    return {message: 'instance of this location has been saved. ', status: true};
  }
  /**
   *
   * @param {object} safetyTriggerParams -- safetyTriggerParams
   * @returns {number} -- returns integer
   */
  static async updateTriggerSafety(safetyTriggerParams) {
    const {requestBody, updateBody, models, dependencies} = safetyTriggerParams;
    const [Trigger] = models;
    const [Dao] = dependencies;
    const {triggerId} = requestBody;

    try {
      const update = await Dao.updateOne(Trigger, {_id: triggerId}, updateBody);
      if ( update && update.acknowledged === true ) return 1;

      return 0;
    } catch (e) {
    }

    return -1;
  }
  /**
   *
   * @param {object} triggerResourceParams -- triggerResourceParams
   * @returns {object} -- returns array
   */
  static async getPushTokensForCron(triggerResourceParams) {
    const {models, dependencies} = triggerResourceParams;
    const [Trigger, User] = models;
    const [Dao] = dependencies;


    let [email, triggerId] = ['', ''];
    const pushTokens = new Map();
    const triggers = await Dao.get(Trigger, {safety_status: 0} );

    if ( triggers.length === 0 ) return [];

    for (const trigger of triggers) {
      email = trigger.email;
      triggerId = trigger._id;


      if ( email !== undefined ) {
        const userRec = await Dao.get(User, {email: email} );
        const user = userRec[0];

        if ( user === undefined ) continue;
        if ( !('pushToken' in user) ) continue;

        const pushToken = user.pushToken;
        const data = {email: email, triggerId: triggerId, pushType: 'location'};

        if ( pushToken !== undefined && !(pushTokens.has(pushToken)) ) pushTokens.set(pushToken, data);
      }
    }

    return pushTokens;
  }
}

module.exports = TriggerService;

