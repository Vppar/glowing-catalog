(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Appointments.
     * 
     * @author Iago Quirino
     */

    angular.module('tnt.catalog.appointments.service', [
        'tnt.catalog.appointments.entity', 'tnt.catalog.appointments.keeper'
    ]).service('AppointmentService', function AppointmentService($log, $q, AppointmentKeeper, Appointment) {

      this.isValid = function(entity) {
            var invalidProperty = {};

            //just name and phone are mandatory
            invalidProperty.name = angular.isDefined(entity.name);
            invalidProperty.phones = angular.isDefined(entity.phones);

            var result = [];

            for ( var ix in invalidProperty) {
                if (!invalidProperty[ix]) {
                    // Create a new empty object, set a property
                    // with the name of the invalid property,
                    // fill it with the invalid value and add to
                    // the result
                    var error = {};
                    error[ix] = entity[ix];
                    result.push(error);
                }
            }

            return result;
        };

        /**
         * Returns the full entity list.
         * 
         * @return Array - entity list.
         */
        this.list = function() {
            var result = null;
            try {
                result = AppointmentKeeper.list();
            } catch (err) {
                $log.debug('AppointmentService.list: Unable to recover the list of appointments. Err=' + err);
            }
            return result;
        };

        /**
         * Returns a single appointment by its id.
         * 
         * @param uuid - Appointment uuid.
         * @return Appointment - The desired entity.
         */
        this.read = function(uuid) {
            var result = null;
            try {
                result = AppointmentKeeper.read(uuid);
            } catch (err) {
                $log.debug('AppointmentService.read: Unable to find an appointment with id=\'' + uuid + '. Err=' + err);
            }
            return result;
        };

        /**
         * Create a appointment in the datastore.
         * 
         * @param appointment - Appointment object to be registered.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.create = function(appointment) {
            var result = null;
            appointment = new Appointment(appointment);
            var hasErrors = this.isValid(appointment);
            if (hasErrors.length === 0) {
                result = AppointmentKeeper.create(appointment);
            } else {
                result = $q.reject(hasErrors);
            }
            return result;
        };

        /**
         * 
         * Update values from appointment
         * 
         * @param appointmentObj - Appointment to be update.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.update = function(appointment) {
            var result = this.isValid(appointment);
            if (result.length === 0) {
                try {
                    AppointmentKeeper.update(appointment);
                } catch (err) {
                    throw 'AppointmentService.update: Unable to update an appointment=' + JSON.stringify(receivable) + '. Err=' + err;
                }
            }
            return result;
        };
        
        /**
         * 
         * Set appointment to Done
         * 
         * @param id - id of Appointment to be update.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.done = function(id) {
        	var result = "";
        	try {
        		var appointment = this.read(id);
        		appointment.status = "DONE";
        		result = this.update(appointment);
            } catch (err) {
                throw 'AppointmentService.done: Unable to done an appointment=' + JSON.stringify(receivable) + '. Err=' + err;
            }
            return result;
        };
        
        /**
         * 
         * Set appointment to Cancel
         * 
         * @param id - id of Appointment to be update.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.cancel = function(id) {
        	var result = "";
        	try {
        		var appointment = this.read(id);
            	appointment.status = "CANCELLED";
            	result = this.update(appointment);	
            } catch (err) {
                throw 'AppointmentService.cancel: Unable to cancel an appointment=' + JSON.stringify(receivable) + '. Err=' + err;
            }
            return result;
        };
        
        this.listByPeriod = function(since,upon,entityuuid){
        	var appointmentsReturn = [];
        	var appointmentsList = this.list();
        	if(appointmentsList)
        	{
	        	for(var idx in appointmentsList)
	        	{
	        		var appointment = appointmentsList[idx];
	        		if(verifyFilterAppointment(appointment,since,upon,entityuuid))
	        		{
	        			appointmentsReturn.push(appointment);
	        		}
	        	}
        	}
        	return appointmentsReturn;
        };
        
        function verifyFilterAppointment(appointment,since,upon,entityuuid)
        {
        	if(appointment && since && upon)
        	{
        		since = new Date(since);
        		upon = new Date(upon);
        		appointment.date = new Date(appointment.date);
        		if(appointment.date >= since && appointment.date <= upon)
        		{
        			if(entityuuid)
        			{
        				if(appointment.contacts)
        				{
	        				for (var idx in appointment.contacts)
	        				{
	        					var entity = appointment.contacts[idx];
	        					alert(entity.uuid);
	        					if(entity.uuid == entityuuid)
	        					{
	        						return true;
	        					}
	        				}
        				}
        			}else
        			{
        				return true;
        			}
        		}
        	}
        	return false;
        }
        
    });

})(angular);