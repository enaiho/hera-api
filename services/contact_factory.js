/**
 * A class that represents the factory for managing contact
 *
 * @class
 */
class ContactFactory {
  /** @class */
  constructor() {
  }
  /**
   * @returns {void} --Notifies the contact that he has been added to solace
   * @access private
   * @param {object} contacts --List of contacts uploaded by the user
   * @param {object} cleanPhoneNumber -- HOF that sanitizes the phone number
   */
  static async #notify(contacts, cleanPhoneNumber) {
    const parseContacts = JSON.parse(contacts);
    if ( parseContacts.length > 0 ) {
      const selectedContact = parseContacts[0];
      const phoneNumbers = selectedContact.phoneNumbers;
      if ( phoneNumbers.length > 0 ) {
        const selectedPhoneNumber = cleanPhoneNumber(phoneNumbers[0].number);
        const messageData = {

          message: `Hello, your friend ${fname} has added you as an emergency contact on Solace.`,
          phone: `${selectedPhoneNumber}`,
          event: `sms`,
        };


        const notification = new Notification();
        notification.sendOTPCode( messageData ); // this method returns a promise

        // const {message, status} = smsResponse;
      }
    }
  }
  /**
   * @returns {object} -- Returns an object containing message and the created status
   * @param {object} factoryParams -- Object that contains dependencies for this method to work
   */
  static async createEmergencyContact(factoryParams) {
    try {
      const {requestBody, models, dependencies} = factoryParams;
      const {Contact, User} = models;
      const {Dao, cleanPhoneNumber, Activity} = dependencies;


      const {email, contacts, userId} = requestBody;
      const payload = {email: email.trim()};
      const parsedContacts = JSON.parse(contacts);

      const contact = new Contact({
        contacts: parsedContacts,
        email: email,
      });


      const contactDocument = await Dao.get( Contact, payload );
      if ( contactDocument.length === 0 ) {
        const savedContact = await contact.save();
        if (!savedContact) return {message: `error occured in creating contact. `, created: false};
      } else {
        const contactList = contactDocument[0].contacts;
        for (const rec of parsedContacts) {
          contactList.push(rec);
        }


        const updateCondition = {email: email};
        const updateBody = {contacts: contactList};
        const updateContact = await Dao.updateOne(Contact, updateCondition, updateBody);

        if ( !updateContact ) return {message: `error occured in creating contact`, created: false};
      }





      // ContactFactory.notify(contacts,cleanPhoneNumber);
      // loop through the parsed_contacts to see if the number is a solace user


      for ( const arrContacts of parsedContacts ) {
        const arrPhoneNumbers = arrContacts.phoneNumbers;
        for ( const recPhone of arrPhoneNumbers ) {

          const sanitizedPhone = cleanPhoneNumber(recPhone.number);
          const user = await Dao.get( User, {phone: sanitizedPhone});

          if ( user.length === 0 ) continue;

          const receiverId = user[0]._id;
          await Activity.createActivity(userId, 'Contact', 'add', receiverId);
          break;
        }
      }
      
      return {message: `contact created successfully. `, created: true};
    } catch (e) {
      console.log( e.message );
      return {message: e.message, created: false};
    }
  }
  /**
   * @returns {object} -- Returns an object containing the message and contacts
   * @param {object} contactParams -- Object that contains dependencies for this method to work
   */
  static async getEmergencyContact(contactParams) {
    try {
      const {requestBody, models, dependencies} = contactParams;
      const [Contact] = models;
      const [Dao] = dependencies;
      const {email} = requestBody;


      const payload = {email: email};
      const contactDoc = await Dao.get( Contact, payload );

      if ( contactDoc.length === 0 ) return {message: `empty contact list`, contacts: []};

      const contacts = contactDoc[0].contacts;

      return {message: `return contact list`, contacts: contacts};
    } catch (e) {
      return {message: e.message, contacts: []};
    }
  }
  /**
   * @returns {object} -- Returns an object containing the message and the deleted status
   * @param {object} contactParams -- Object that contains dependencies for this method to work
   */
  static async deleteEmergencyContact(contactParams) {
    try {
      const {requestParams, requestBody, models, dependencies} = contactParams;
      const [Contact, User] = models;
      const [Dao, cleanPhoneNumber, Activity] = dependencies;


      const {email} = requestParams;
      const {lookupKey} = requestBody;


      const payload = {email: email};
      const contactDoc = await Dao.get( Contact, payload );


      if ( contactDoc.length === 0 ) return {message: `this user doesn't have any contact`, deleted: false};

      const userDoc = await Dao.get(User, payload);


      if ( userDoc.length === 0 ) return {message: `this user rec does not exists`, deleted: false};

      const {userId} = userDoc[0];

      const {contacts} = contactDoc[0]; // contacts is an array so we would loop through the array;
      let spliced = false;


      for ( const [index, contact] of contacts.entries() ) {
        if ( contact.lookupKey.trim() !== lookupKey.trim() ) continue;


        // check if the contact exists as a user in the system.


        const {receiverId, status, pushToken} = await ContactFactory.#isContactHasAccount( contact, User, Dao, cleanPhoneNumber );

        // console.log( status );
        // return;


        if ( status === true ) {
          // console.log( pushToken );


          const pushTokens = new Map();
          const data = {'message': 'This is the test trigger message'};
          pushTokens.set( pushToken, data);


          Activity.createActivity(userId, 'Contact', 'delete', receiverId);
          // SolacePNService( pushTokens );


          // call the push notification
        }


        spliced = true;
        contacts.splice(index, 1);
        break;
      }


      if ( spliced === false ) return {message: `this contact does not exist to be deleted. `, deleted: false};


      const updateCondition = {email: email};
      const updateBody = {contacts: contacts};
      const updateContact = await Dao.updateOne( Contact, updateCondition, updateBody );


      if ( updateContact ) return {message: `deleted contact successfully`, deleted: true};


      return {message: `error in deleting contact. `, deleted: false};
    } catch (e) {
      return {message: e.message, deleted: false};
    }
  }
  /**
   * @returns {boolean} -- Returns a boolean checking if user has an emergency contact
   * @param {string} phone -- Phone number of the emergency contact
   * @param {object} ContactModel -- Contact Model
   * @param {object} UserModel -- User Model
   * @param {object} Dao -- Dao service class
   */
  static async isHaveEmergencyContact(phone, ContactModel, UserModel, Dao) {
    try {
      let payload = {phone: phone};
      const user = await Dao.get( UserModel, payload );

      if ( user.length === 0 ) return false;

      const {email} = user[0];

      payload = {email: email};
      const contact = await Dao.get( ContactModel, payload );

      if ( contact.length === 0 ) return false;

      const {contacts} = contact[0];
      if ( contacts.length === 0 ) return false;

      return true;
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
  }
  /**
   * @returns {boolean} -- Returns a boolean checking if user has an emergency contact
   * @access private
   * @param {object} contact -- Contact object to check if user has an account
   * @param {object} UserModel -- User Model
   * @param {object} Dao -- Dao service class
   * @param {object} cleanPhoneNumber -- HOF to sanitize phone number
   */
  static async #isContactHasAccount( contact, UserModel, Dao, cleanPhoneNumber ) {
    try {
      const arrPhoneNumbers = contact.phoneNumbers;
      for ( const recPhone of arrPhoneNumbers ) {
        const sanitizedPhone = cleanPhoneNumber(recPhone.number);
        const user = await Dao.get( UserModel, {phone: sanitizedPhone});

        if ( user.length === 0 ) continue;

        const {_id, pushToken} = user[0];

        console.log( pushToken );

        return {receiverId: _id, status: true, pushToken: pushToken};
        break;
      }
    } catch (e) {
      console.log( e.message);
      return {receiverId: '', status: false};
    }

    return {receiverId: '', status: false};
  }
}

module.exports = ContactFactory;
