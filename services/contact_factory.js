

class ContactFactory{


	constructor(){		
	}

	static async #notify(contacts,cleanPhoneNumber){


		const parseContacts = JSON.parse(contacts);
		if( parseContacts.length > 0 ){


			const selectedContact = parseContacts[0];
	 		const phoneNumbers = selectedContact.phoneNumbers;
	 		if( phoneNumbers.length > 0 ){
	 			const selectedPhoneNumber = cleanPhoneNumber(phoneNumbers[0].number);
	 			const message_data = {

					message: `Hello, your friend ${fname} has added you as an emergency contact on Solace.`,
					phone: `${selectedPhoneNumber}`,
					event: `sms`
				}


				const notification = new Notification();
				const sms_response =  await notification.sendOTPCode( message_data );

				const { message,status } = sms_response;
	 			
	 		}




		}
	}
	static async createEmergencyContact(factoryParams){

		try{


			const { requestBody,models,dependencies } = factoryParams;
			const [ Contact  ] = models;
			const [ Dao,Notification,cleanPhoneNumber ] = dependencies;		
			

			const { email,phone,contacts } = requestBody;
			const payload = { email:email.trim()  };
			const parsed_contacts = JSON.parse(contacts);


			const contact = new Contact({
		        contacts:parsed_contacts,
		        email:email
		    });


			const contactDocument = await Dao.get( Contact,payload );
			if( contactDocument.length === 0 ){

				const saved_contact = await contact.save();
			    if(!saved_contact) return { message:`error occured in creating contact. `, created:false };

			}
			else{  


				const contact_list = contactDocument[0].contacts;

				for(const rec of parsed_contacts){
					contact_list.push(rec);
				}


				const updateCondition = { email:email }; 
				const updateBody = { contacts:contact_list }
				const updateContact = await Dao.updateOne(Contact,updateCondition,updateBody);

				if( !updateContact ) return { message: `error occured in creating contact`, created: false };


			}

			// ContactFactory.notify(contacts,cleanPhoneNumber);
			return { message:`contact created successfully. `, created:true }


		}
		catch(e){
			return { message:e.message, created:false };
		}
	}
	static async getEmergencyContact(contactParams){


		try{

			const { requestBody,models,dependencies } = contactParams;
			const [ Contact ] = models;
			const [ Dao ] = dependencies;	
			const { email } = requestBody;


			const payload = { email:email }
			const contact_doc = await Dao.get( Contact,payload );

			if( contact_doc.length === 0 ) return { message:`empty contact list`, contacts:[]  };

			const contacts = contact_doc[0].contacts;

			return { message:`return contact list`, contacts:contacts };


		}
		catch(e){
			return { message:e.message, contacts:[] };
		}
	}
	static async deleteEmergencyContact(contactParams){



		try{

			const { requestParams,requestBody,models,dependencies } = contactParams;
			const [ Contact ] = models;
			const [ Dao ] = dependencies


			const { email } = requestParams;
			const { lookupKey } = requestBody;



			const payload = { email:email };
			const contact_doc = await Dao.get( Contact, payload );



			if( contact_doc.length === 0  ) return { message:`this user doesn't have any contact`, deleted:false  };


			const {contacts} = contact_doc[0]; // contacts is an array so we would loop through the array;
			let spliced = false;


			for( const [index,contact] of contacts.entries() ){




				if( contact.lookupKey.trim() !== lookupKey.trim() ) continue;

				spliced = true;
				contacts.splice(index,1);
				break;
				

			}


			if( spliced === false ) return { message: `this contact does not exist to be deleted. `, deleted:false };


			const updateCondition = { email:email  }
			const updateBody = { contacts:contacts }
			const updateContact = await Dao.updateOne( Contact,updateCondition,updateBody );


			if( updateContact ) return { message:`deleted contact successfully`, deleted:true };


			return { message:`error in deleting contact. `, deleted:false };


		}
		catch(e){
			return { message:e.message, deleted:false };
		}

	}

}


module.exports = ContactFactory;