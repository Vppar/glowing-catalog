(function(angular) {
	'use strict';
	angular.module('tnt.catalog.appointments.ctrl',
			[ 'tnt.catalog.appointments.service', 'tnt.utils.array' ])
			.controller(
					'AppointmentsCtrl',
					function($scope, $location, $filter, ArrayUtils,
							AppointmentService, EntityService, UserService) {

						UserService.redirectIfIsNotLoggedIn();
							
						
						// #############################################################################################################
						// Warming up the controller
						// #############################################################################################################

						$scope.entities = EntityService.list();
						
						var dtInitial = new Date();
						dtInitial.setHours(0);
						dtInitial.setMinutes(0);
						dtInitial.setSeconds(0);

						var dtFinal = new Date();
						dtFinal.setHours(23);
						dtFinal.setMinutes(59);
						dtFinal.setSeconds(59);

						$scope.dateFilter = {
							dtInitial : dtInitial,
							dtFinal : dtFinal
						};

						// #############################################################################################################
						// Local functions and variables
						// #############################################################################################################

						//ng-init="listAppointmentsByPeriod()" 
						//ng-controller="AppointmentsCtrl"
						$scope.listAppointmentsByPeriod = function() {
							$scope.appointments = AppointmentService.listAppointmentsByPeriod($scope.dateFilter.dtInitial, $scope.dateFilter.dtFinal);
						};

						//<div ng-repeat="appointment in appointments" ng-click="done([appointment])">
						$scope.done = function(appointmentId) {
							$scope.appointments = AppointmentsService.doneAppointment(appointmentId);
						};

						//<div ng-repeat="appointment in appointments" ng-click="cancel([appointment])">
						$scope.cancel = function(appointmentId) {
							$scope.appointments = AppointmentsService.cancelAppointment(appointmentId);
						};

						//<div ng-repeat="appointment in appointments" ng-click="create([appointment])">
						$scope.create = function(appointment) {
							$scope.appointments = AppointmentsService.createAppointment(appointment);
						};

						//<div ng-repeat="appointment in appointments" ng-click="update([appointment])">
						$scope.update = function(appointment) {
							AppointmentsService.updateAppointment(appointment);
						};
						
						
						$scope.createAppointment = function (type)
						{
							var appointment = {
					                title : 'VISITA NO CLIENTE',
					                description : 'VISITA DIA 12/01/2014',
					                date: '12/01/2014',
					                startTime: '12:00',
					                endTime: '12:30',
					                address : {street: 'rua', number: 555, cep: '12222-000'},
					                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
					                type : type,
					                status: 'PENDENTE'
					        };
							AppointmentService.create(appointment);
						};

					});
}(angular));