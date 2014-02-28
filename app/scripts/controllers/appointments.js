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

						$scope.contacts = EntityService.list();
						
						$scope.birthdates = '';

						$scope.appointment = undefined;
						$scope.type = undefined;
						
						$scope.appointments = AppointmentService.list();

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

						$scope.remove = function(appointment) {
							$scope.appointments.splice($scope.appointments.indexOf(appointment), 1);
						};

						$scope.listAppointmentsByPeriod = function() {
							$scope.appointments = AppointmentService
									.listAppointmentsByPeriod(
											$scope.dateFilter.dtInitial,
											$scope.dateFilter.dtFinal);
						};
						
						$scope.done = function(appointment) {	
						   AppointmentService.done(appointment).then(function() {
							   alert('Evento Finalizado com sucesso!');
				               $scope.appointments = AppointmentService.list();
				            }, function(err) {
				            	alert('Erro: ' + err);
				            });
			               
						};

						$scope.cancel = function(appointment) {							
							AppointmentService.cancel(appointment).then(function() {
								   alert('Evento Cancelado com sucesso!');
					               $scope.appointments = AppointmentService.list();
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
						};

						$scope.update = function(appointment) {
							AppointmentsService.update(appointment);
						};

						$scope.listBirthdatesByPeriod = function (since, upon) {
							$scope.birthdates = [ {
								"id" : 1,
								"data" : "12-12-1910",
								"nome" : "ROGER"							
							}, {
								"id" : 2,
								"data" : "12-12-1920",
								"nome" : "IAGO"
							}, {
								"id" : 3,
								"data" : "12-12-1930",
								"nome" : "RENNAN"
							} ];
					        //Chamada do service;
					    };
					    
					    $scope.setType = function(type)
						{
							$scope.type = type;
						};
						
						$scope.create = function ()
						{
							if(!$scope.type)
							{
								alert('Selecione um tipo de evento');
								return;
							}
							$scope.appointment.type = $scope.type;
							$scope.appointment.status = 'PENDANT';
							AppointmentService.create($scope.appointment).then(function(uuid) {
				               alert('Cadastro efetuado com sucesso');
				               $scope.appointment = undefined;
				               $scope.type = undefined;
				               $scope.appointments = AppointmentService.list();
				            }, function(err) {
				            	alert('Erro:' + err);
				            });
							
						};
					    
					});
}(angular));