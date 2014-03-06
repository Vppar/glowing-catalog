(function(angular) {
	'use strict';
	angular.module('tnt.catalog.appointments.ctrl',
			[ 'tnt.catalog.appointments.service', 'tnt.utils.array' ])
			.controller(
					'AppointmentsCtrl',
					function($scope, $location, $filter, ArrayUtils,
							AppointmentService, EntityService, UserService) {

						UserService.redirectIfIsNotLoggedIn();

						$scope.contador = 0;
						$scope.tempDate = undefined;
						
						// tags arrastáveis
						$('.external-event').each(function() {
							
							// create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
							// it doesn't need to have a start or end
							var id = $(this).attr("id");
							id = id.replace("tagEvent","");

							var eventObject = {
								eventType: id
							};
							
							// store the Event Object in the DOM element so we can get to it later
							$(this).data('eventObject', eventObject);
							
							// make the event draggable using jQuery UI
							$(this).draggable({
								zIndex: 999,
								revert: true,      // will cause the event to go back to its
								revertDuration: 0  //  original position after the drag
							});
							
						});

						function eventsInDay(date) { //retorna quantos eventos existem na mesma data
							var evts = $('#calendar').fullCalendar('clientEvents');
							var count = 0;
							for(var i=0; i<evts.length; i++) {
								if(evts[i].start.getDate() == date.getDate() && evts[i].start.getMonth() == date.getMonth() && evts[i].start.getFullYear() == date.getFullYear()){
									count++;
								}
							}
							return count;
						}

						function isNewEvent(event) {
							var evts = $('#calendar').fullCalendar('clientEvents');
							for (var i = 0 ; i < evts.length ; i++) {
								if (evts[i].title == event.title && evts[i].client == event.client && evts[i].start.getDate() == event.start.getDate() && evts[i].start.getMonth() == event.start.getMonth() && evts[i].start.getFullYear() == event.start.getFullYear()) {
									return false;
								}
							}
							return true;
						}

						function openNewEventDialog(eventType, hour, minute, client, title, desc, eventEdit) { // abre pop de cadastro do evento
							if(eventType) {
								$("#select-event-u").val(eventType);
								$("#select-event").val(eventType);
							} else {
								$("#select-event").val(0);
							}
							if(hour) {
								$("#select-hour").val(hour);
								$("#select-hour-u").val(hour);
							} else {
								$("#select-hour").val(8);
							}
							if(minute) {
								$("#select-minute").val(minute);
								$("#select-minute-u").val(minute);
							} else {
								$("#select-minute").val(0);
							}
							if(title) {
								$("#txt-title-u").val(title);
							} else {
								$("#txt-title").val("");
							}
							if(desc) {
								$("#txt-description-u").val(desc);
							} else {
								$("#txt-description").val("");
							}
							
							if(eventEdit) {
								var title = 'Alterar evento';
								$("#event-status-u").val(eventEdit.status);
								$("#event-id-u").val(eventEdit.uuid);
								$("#calendar-id-u").val(eventEdit.id);
								$("#dialog-update").dialog({
									modal: true,
									title: title
								});
							} else {
								var title = "Novo evento";
								$( "#dialog" ).dialog({
									modal: true,
									title: title
								});
							}
							
						}

						$scope.closeDialog = function() { // fecha dialogo
							$("#dialog").dialog( "close" );
							$scope.cancelarEdicao();
						};

						$scope.closeDialogUpdate = function() { // fecha dialogo
							$("#dialog-update").dialog( "close" );
							$scope.cancelarEdicao();
						};
						
						
						// #############################################################################################################
						// Warming up the controller
						// #############################################################################################################

						$scope.contacts = undefined;
						$scope.birthdays = [];
						$scope.appointments = [];
						
						$scope.appointment = undefined;
						$scope.appointmentToUpdate = undefined; 

						/**
						 * Initialize calendar component
						 */
						$scope.loadCalendar = function()
						{
							$scope.contacts = EntityService.list();
							
							$('#calendar').fullCalendar({
								buttonText: {
									prev: 'Ant.',
									next: 'Prox.',
									today: 'Hoje',
									month: 'M&#234;s',
									agendaWeek: 'Semana',
									agendaDay: 'Dia'
								},
								monthNames: ['Janeiro', 'Fevereiro', 'Mar&#231;o', 'Abril', 'Maio', 'Junho', 'Julho',
									'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
								dayNames: ['Domingo', 'Segunda', 'Ter&#231;a', 'Quarta',	'Quinta', 'Sexta', 'S&#225;bado'],
								dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&#225;b'],
								
								header: {
									left: 'prev,next today',
									center: 'title',
									right: 'agendaDay,agendaWeek,month'
								},
								
								selectable: true,
								selectHelper: true,
								droppable: true,
								drop: function(date, allDay) { // função quando solta tag sobre calendário
									var eventObject = $(this).data('eventObject');
									/* NOVO CÓDIGO */
									if($('#calendar').fullCalendar('getView').name == 'month') {
										var actualDate = new Date();
										if (actualDate.getHours() >= 22 || actualDate.getHours() <= 6) {
											date.setHours(actualDate.getHours());
										} else {
											date.setHours(actualDate.getHours() + 2);
										}
										date.setMinutes(actualDate.getMinutes());
									}
									$scope.tempDate = date;
									/* FIM NOVO CÓDIGO */
									openNewEventDialog(eventObject.eventType, date.getHours(), date.getMinutes());
								},
								select: function(start, end, allDay) { // quando clica em uma data/hora 
									if(eventsInDay(start) > 0 && $('#calendar').fullCalendar('getView').name == 'month') {
										$('#calendar').fullCalendar('changeView', 'agendaDay');
										$('#calendar').fullCalendar('gotoDate', start);
									} else {
										/* NOVO CÓDIGO */
										if ($('#calendar').fullCalendar('getView').name == 'month') {
											var actualDate = new Date();	
											if (actualDate.getHours() >= 22 || actualDate.getHours() <= 6) {
												start.setHours(actualDate.getHours());
											} else {
												start.setHours(actualDate.getHours() + 2);
											}
										}
										$scope.tempDate = start;
										/* FIM NOVO CÓDIGO */
										openNewEventDialog(null, start.getHours(), start.getMinutes());
									}
								},
								eventClick: function(calEvent, jsEvent, view) {
									if(!calEvent.allDay)
									{
										$scope.appointmentToUpdate = $scope.getEvent(calEvent.uuid);
										var client = $scope.appointmentToUpdate != null ? $scope.appointmentToUpdate.contacts : undefined;
										openNewEventDialog(calEvent.type, calEvent.start.getHours(), calEvent.start.getMinutes(), client, calEvent.title, calEvent.description, calEvent);
									}
								},
								viewRender: function(view, element) {
									$('#calendar').ready(function() {
										$('#calendar .fc-widget-header').each(function(i) {
										     $(this).text($(this).text().replace('&#231;', 'ç').replace('&#225;', 'á'));
										});
										
										$scope.updateCalendar();
										$scope.contador = 0;
										
										if ($scope.birthdays) {
											for (var idx in $scope.birthdays) {
												var entity = $scope.birthdays[idx];
												var yearCurrent = $('#calendar').fullCalendar('getDate').getFullYear();
												var thisDate = new Date(yearCurrent, entity.birthDate['month'] -1, entity.birthDate['day']);
												$scope.contador = $scope.contador + 1;
												var event = {
													title: 'Aniversário de ' + entity.name,
													start: thisDate,
													allDay: true,
													color: $('.tag7').find('.tag-circle').css('background-color'),
													description: '',
													client: entity.name,
													type: 7,
													id: $scope.contador
												};
												if (isNewEvent(event)) {
													$('#calendar').fullCalendar('renderEvent', event, true);
												}
											}
										}
										if ($scope.appointments) 
										{
											for(var idx in $scope.appointments)
											{
												var app = $scope.appointments[idx];
												$scope.contador = $scope.contador + 1;
												var event = {
														title: app.title,
														start: app.date,
														allDay: false,
														color: $('.tag'+app.type).find('.tag-circle').css('background-color'),
														description: app.description,
														client: "teste",
														type: app.type,
														id: $scope.contador,
														uuid: app.uuid
												};
												if (isNewEvent(event)) {
													$('#calendar').fullCalendar('renderEvent', event, true);
												}
											}
										}
									});
								},
								editable: true
								
							});

						};

						
						// #############################################################################################################
						// Local functions and variables
						// #############################################################################################################
						

						$scope.updateCalendar = function ()
						{
							var actualSince; 
							var actualUpon; 
							if ($('#calendar').fullCalendar('getView').name == 'month') {
								actualSince = ($.datepicker.parseDate('yy-mm-dd', $('tr.fc-week.fc-first td:eq(0)').attr('data-date')));
								actualUpon = ($.datepicker.parseDate('yy-mm-dd', $('tr.fc-week.fc-last td:eq(6)').attr('data-date')));
							} else if ($('#calendar').fullCalendar('getView').name == 'agendaWeek') {
								var headerTitle = $('.fc-header-title').text();
								actualSince = ($.datepicker.parseDate('M d', headerTitle.split('—')[0].trim()));
								if (!isNaN(parseInt(headerTitle.charAt(headerTitle.indexOf('—') + 2), 10))) {
									actualUpon = ($.datepicker.parseDate('M d', headerTitle.split('—')[0].substr(0, 4) + headerTitle.split('—')[1].substr(1, 1)));
								} else {
									actualUpon = ($.datepicker.parseDate('M d', headerTitle.split('—')[1].substr(1, headerTitle.lastIndexOf(' '))));
								}
							} else {
								var headerTitle = $('.fc-header-title').text();
								actualSince = ($.datepicker.parseDate('M d', headerTitle.split(',')[1].trim()));
								actualUpon = ($.datepicker.parseDate('M d', headerTitle.split(',')[1].trim()));
							}
							
							$scope.birthdays = EntityService.listByBirthDate(actualSince, actualUpon);
							$scope.appointments = AppointmentService.listAppointmentsByPeriod(actualSince,actualUpon);
						};
						

						$scope.remove = function(appointment) {
							$scope.appointments.splice($scope.appointments.indexOf(appointment), 1);
						};

						
						$scope.done = function(appointmentToUpdate) {
						   AppointmentService.done(appointmentToUpdate).then(function() {
							   alert('Evento Finalizado com sucesso!');
							   $scope.closeDialogUpdate();
							   $scope.updateCalendar();
				            }, function(err) {
				            	alert('Erro: ' + err);
				            });
			               
						};

						$scope.cancel = function(appointmentToUpdate) {							
							AppointmentService.cancel(appointmentToUpdate).then(function() {
								   alert('Evento Cancelado com sucesso!');
								   $scope.closeDialogUpdate();
								   $scope.updateCalendar();
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
						};
						
						$scope.listBirthdaysByPeriod = function() {
							$scope.birthdays = EntityService.listByBirthDate($scope.dateFilter.dtInitial, $scope.dateFilter.dtFinal);
						};

					    
						$scope.cancelarEdicao = function() {
							$scope.appointment = undefined;
							$scope.appointmentToUpdate = undefined;
						};	
						
						$scope.prepareUpdate = function(appointment) {
							$scope.appointmentToUpdate = angular.copy(appointment);
						};	
						
						$scope.update = function() {
							if(!$scope.appointmentToUpdate) {
								alert('Selecione um evento para ser atualizado');
								return;
							}
							prepareUpdate($scope.appointmentToUpdate);
							
							var hour = $("#select-hour-u").val();
							var minute = $("#select-minute-u").val();
							var time = hour+":"+minute;
							
							var calendarId = $("#calendar-id").val();
							$('#calendar').fullCalendar('removeEvents', calendarId);
							
							$scope.appointmentToUpdate.date = $scope.tempDate;
							$scope.appointmentToUpdate.startTime = time;
							$scope.appointmentToUpdate.endTime = time;
							$scope.appointmentToUpdate.allDay =  false;
							$scope.appointmentToUpdate.color =  $('.tag' + $scope.appointmentToUpdate.type).find('.tag-circle').css('background-color');
							delete $scope.appointmentToUpdate.isValid;
							
							AppointmentService.update($scope.appointmentToUpdate).then(function(uuid) {
									var app = $scope.getEvent($scope.appointmentToUpdate.uuid);
									var event = {
											title: app.title,
											start: app.date,
											allDay: false,
											color: $('.tag'+app.type).find('.tag-circle').css('background-color'),
											description: app.description,
											client: "teste",
											type: app.type,
											id: calendarId,
											uuid: $scope.appointmentToUpdate.uuid
									};
								
					               alert('Atualizacao efetuada com sucesso');
					               $('#calendar').fullCalendar('renderEvent', event, true);
								   $scope.closeDialogUpdate();
								   $scope.updateCalendar();
					            }, function(err) {
					            	alert('Erro:' + err);
					            });
						};
						
						$scope.getEvent = function(appointmentId) {
							if(appointmentId)
							{
								var appointmentList = AppointmentService.list();
								if(appointmentList)
								{
									for(var idx in appointmentList)
									{
										var app = appointmentList[idx];
										if(app.uuid == appointmentId)
										{
											return app;
										}
									}	
								}
							}
							return {};
						};	
						
//						$scope.persist = function () { //salva o evento
//							var eventId = $("#event-id").val();
//							var calendarId = $("#calendar-id").val();
//							var eventStatus = $("#event-status").val();
//							var eventType = $("#select-event").val();
//							var client = $("#select-client").val();
//							if(eventType == "") {
//								alert('Selecione o tipo de evento.');
//								return;
//							}
//							if(client == "")
//							{
//								alert('Selecione um cliente.');
//								return;
//							}
//							
//							var eventColor = $('.tag' + eventType).find('.tag-circle').css('background-color');
//							var hour = $("#select-hour").val();
//							var minute = $("#select-minute").val();
//							var time = hour+":"+minute;
//							
//							var title = $("#txt-title").val();
//							var desc = $("#txt-description").val();
//							
//							var date = $scope.tempDate;
//							date.setHours(hour);
//							date.setMinutes(minute);
//							
//							var event = $scope.verifyEvent(eventId);
//							event.title =  title;
//							event.date =  $scope.tempDate;
//							event.startTime =  time;
//							event.endTime =  time;
//							event.status =  eventStatus;
//							event.allDay =  false;
//							event.color =  eventColor;
//							event.description =  desc;
//							event.contacts = client;
//							event.type =  eventType;
//
//							if(eventId)
//							{
//								$('#calendar').fullCalendar('removeEvents', calendarId);
//								$scope.update(event);
//							}else
//								{
//									$scope.create(event);	
//								}
//						};
						
						$scope.create = function ()	{
							var hour = $("#select-hour").val();
							var minute = $("#select-minute").val();
							var time = hour+":"+minute;
							
							$scope.appointment.date = $scope.tempDate;
							$scope.appointment.startTime = time;
							$scope.appointment.endTime = time;
							$scope.appointment.status = 'PENDANT';
							$scope.appointment.allDay =  false;
							$scope.appointment.color =  $('.tag' + $scope.appointment.type).find('.tag-circle').css('background-color');
							
							AppointmentService.create($scope.appointment).then(function(uuid) {
								$scope.contador = $scope.contador + 1;
								var app = $scope.getEvent(uuid);
								
								var event = {
										title: app.title,
										start: app.date,
										allDay: false,
										color: $('.tag'+app.type).find('.tag-circle').css('background-color'),
										description: app.description,
										client: "teste",
										type: app.type,
										id: $scope.contador,
										uuid: uuid
								};	
								
							  alert('Evento cadastrado com sucesso');
							  $('#calendar').fullCalendar('renderEvent', event, true);
							  $scope.closeDialog();
							  $scope.updateCalendar();
				            }, function(err) {
				            	alert('Erro:' + err);
				            });
						};
					    
					});
}(angular));