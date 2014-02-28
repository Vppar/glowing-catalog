(function(angular) {
	'use strict';
	angular.module('tnt.catalog.appointments.ctrl',
			[ 'tnt.catalog.appointments.service', 'tnt.utils.array' ])
			.controller(
					'AppointmentsCtrl',
					function($scope, $location, $filter, ArrayUtils,
							AppointmentService, EntityService, UserService) {

						//UserService.redirectIfIsNotLoggedIn();

						// #############################################################################################################
						// Warming up the controller
						// #############################################################################################################

						//$scope.entities = EntityService.list();
						
						$scope.contacts = [ {
							"id" : 1,
							"nome" : "ROGER"
						}, {
							"id" : 2,
							"nome" : "IAGO"
						}, {
							"id" : 3,
							"nome" : "RENNAN"
						} ];
						
						$scope.birthdates = '';

						$scope.appointments = [ {
							"id" : 1,
							"dataEvento" : "12-12-2014",
							"status" : "PENDENTE",
							"tipoEvento" : "VISITA",
							"descricao" : "Visita na casa do valtanete"
						}, {
							"id" : 2,
							"dataEvento" : "12-12-2010",
							"status" : "CANCELADO",
							"tipoEvento" : "REUNIAO",
							"descricao" : "Reuniao na casa do Roger"
						}, {
							"id" : 3,
							"dataEvento" : "08-11-2013",
							"status" : "OK",
							"tipoEvento" : "LIGACAO",
							"descricao" : "Ligar para o Iago"
						} ];

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

						$scope.create = function() {
							$scope.appointments.push({
								id : $scope.appointment.id,
								descricao : $scope.appointment.descricao,
								tipoEvento : $scope.appointment.tipoEvento,
								dataEvento : $scope.appointment.dataEvento
							});
							$scope.appointment.id = $scope.appointment.descricao = $scope.appointment.dataEvento = '';
						};

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
							var index = $scope.appointments.indexOf(appointment);
							appointment.status="DONE";
							$scope.appointments[index]=appointment;
						};

						$scope.cancel = function(appointment) {							
							var index = $scope.appointments.indexOf(appointment);
							appointment.status="CANCEL";
							$scope.appointments[index]=appointment;
						};

						$scope.update = function(appointment) {
							AppointmentsService.updateAppointment(appointment);
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
					    
						/*$scope.createAppointment = function(type) {
							var appointment = {
								title : 'VISITA NO CLIENTE',
								description : 'VISITA DIA 12/01/2014',
								date : '12/01/2014',
								startTime : '12:00',
								endTime : '12:30',
								address : {
									street : 'rua',
									number : 555,
									cep : '12222-000'
								},
								contacts : [ {
									uuid : 'uidcontato1'
								}, {
									uuid : 'uidcontato2'
								} ],
								type : type,
								status : 'PENDENTE'
							};
							AppointmentService.create(appointment);
						};*/

					});
}(angular));