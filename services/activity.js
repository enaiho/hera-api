
const ActivityModel = require('../models/activity');
const Dao = require('./dao');


/**
 * A class representing an activity
 *
 * @class
 */
class Activity {
/** @class */
  constructor() {
  }

  /**
   * @returns {boolean} -- Returns a boolean value to the user to check if user has been registered
   * @param {string} userId  --Represents the userId
   * @param {string} service --Represents the service
   * @param {string} action --Represents the action
   * @param {string} receiverId --Represents the receiver id
  @function
   */
  static async createActivity( userId, service, action, receiverId ) {
    try {
      const requestBody = {
        userId: userId,
        service: service,
        action: action,
        receiverId: receiverId,
      };

      Dao.save( ActivityModel, requestBody ).then( (res) => {
        if ( res ) return true;
        return false;
      });
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
  }

  /**
   * @returns {object} -- Returns a list of activities to the user
   * @param {string} userId  --Represents the userId
  @function
   */
  static async getActivity(userId) {
    return [];
  }
}


module.exports = Activity;
