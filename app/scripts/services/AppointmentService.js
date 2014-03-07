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

            //just title and description are mandatory
            invalidProperty.titulo = angular.isDefined(entity.title);
            invalidProperty.data_inicial = angular.isDefined(entity.startDate);
            invalidProperty.data_final = angular.isDefined(entity.endDate);
            invalidProperty.descricao = angular.isDefined(entity.description);
            invalidProperty.status = angular.isDefined(entity.status);
            invalidProperty.tipo = angular.isDefined(entity.type);
            invalidProperty.cliente = angular.isDefined(entity.contacts);

            var result = [];

            for ( var ix in invalidProperty) {
                if (!invalidProperty[ix]) {
                    // Create a new empty object, set a property
                    // with the name of the invalid property,
                    // fill it with the invalid value and add to
                    // the result
                    result.push(ix);
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
        
        this.listAppointmentsByPeriod = function(since,upon)
        {
        	var appointmentReturn = [];
        	var appointmentList = this.list();
        	if(appointmentList)
        	{
	        	for(var idx in appointmentList)
	        	{
	        		var appointment = appointmentList[idx];
	        		var dateAppointment = new Date(appointment.startDate);
	        		dateAppointment.setHours(0);
	        		dateAppointment.setMinutes(0);
	        		if(dateAppointment.getTime() >= since.getTime() && dateAppointment.getTime() <= upon.getTime())
	        		{
	        			appointmentReturn.push(appointment);
	        		}
		        }
        	}
        	return appointmentReturn;
        };

        this.loadByUUID = function (uuid)
        {
        	if(uuid)
			{
				var appointmentList = this.list();
				if(appointmentList)
				{
					for(var idx in appointmentList)
					{
						var app = appointmentList[idx];
						if(app.uuid == uuid)
						{
							return app;
						}
					}	
				}
			}
			return {};
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
        	var result = null;
        	var hasErrors = this.isValid(appointment);
            if (hasErrors.length === 0) {
            	result = AppointmentKeeper.update(appointment);
            }
            else
            {
            	result = $q.reject(hasErrors);
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
        this.done = function(uuid) {
        	var result = "";
        	try {
        		var appointment = this.loadByUUID(uuid);
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
        this.cancel = function(uuid) {
        	var result = "";
        	try {
        		var appointment = this.loadByUUID(uuid);
        		appointment.status = "CANCELLED";
            	result = this.update(appointment);	
            } catch (err) {
                throw 'AppointmentService.cancel: Unable to cancel an appointment=' + JSON.stringify(receivable) + '. Err=' + err;
            }
            return result;
        };
        
        
    });

})(angular);