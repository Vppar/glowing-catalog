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
						
						// tags arrastaveis
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

							if(client) {								
								$("#select-client-u").val(client);
							} else {
								$("#select-client").val("");
								$("#select-client-u").val("");
							}								

							if(eventEdit) {
								var title = 'Alterar evento';
								$("#event-status-u").val(eventEdit.status);
								$("#event-id-u").val(eventEdit.uuid);
								$("#calendar-id-u").val(eventEdit.id);
								if(eventEdit.status=='CANCELLED' || eventEdit.status=='DONE')
								{
									$("#btn-alterar").addClass('hide');
									$("#btn-concluir").addClass('hide');
									$("#btn-cancelar").addClass('hide');
								}
								else
								{
									$("#btn-alterar").removeClass('hide');
									$("#btn-concluir").removeClass('hide');
									$("#btn-cancelar").removeClass('hide');
								}
								$("#btn-concluir").val(eventEdit.id);
								$("#btn-cancelar").val(eventEdit.id);
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
						
						
						$scope.appointment = undefined;
						$scope.appointmentToUpdate = undefined; 

						/**
						 * Initialize calendar component
						 */
						$scope.rebuildCalendar = function()
						{
							$scope.contacts = [];
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
								drop: function(date, allDay) { // funcao quando solta tag sobre calendario
									var eventObject = $(this).data('eventObject');
									
									/* NOVO CODIGO */									
									if($('#calendar').fullCalendar('getView').name == 'month') {
										var actualDate = new Date();
										if (actualDate.getHours() <= 22) {
											date.setHours(actualDate.getHours() + 2);
										}									
									}
									$scope.tempDate = date;
									/* FIM NOVO C�DIGO */

									openNewEventDialog(eventObject.eventType, date.getHours(), date.getMinutes());
								},
								select: function(start, end, allDay) { // quando clica em uma data/hora 
									if(eventsInDay(start) > 0 && $('#calendar').fullCalendar('getView').name == 'month') {
										$('#calendar').fullCalendar('changeView', 'agendaDay');
										$('#calendar').fullCalendar('gotoDate', start);
									} else {
										/* NOVO C�DIGO */
										if ($('#calendar').fullCalendar('getView').name == 'month') {
											var actualDate = new Date();	
											if (actualDate.getHours() <= 22) {
												start.setHours(actualDate.getHours() + 2);
											}
										}
										$scope.tempDate = start;
										/* FIM NOVO CODIGO */
										openNewEventDialog(null, start.getHours(), start.getMinutes());
									}
								},
								eventClick: function(calEvent, jsEvent, view) {
									if(!calEvent.allDay)
									{
										$scope.appointmentToUpdate = $scope.getEvent(calEvent.uuid);
										$scope.tempDate = $scope.appointmentToUpdate.date; 
										var client = $scope.appointmentToUpdate != null ? $scope.appointmentToUpdate.contacts : undefined;
										openNewEventDialog(calEvent.type, calEvent.start.getHours(), calEvent.start.getMinutes(), client, calEvent.title, calEvent.description, calEvent);
									}
								},
								viewRender: function(view, element) {
								$('#calendar').fullCalendar('removeEvents');
									$('#calendar').ready(function() {
										$('#calendar .fc-widget-header').each(function(i) {
										     $(this).text($(this).text().replace('&#231;', '�').replace('&#225;', '�'));
										});
									});
									$scope.rebuildEvents();
								},
								editable: true
								
							});

						};

						
						// #############################################################################################################
						// Local functions and variables
						// #############################################################################################################
						

						$scope.rebuildEvents = function ()
						{
							var actualSince; 
							var actualUpon;
							var birthdays = [];
							var appointments = [];
							var events = [];
							if ($('#calendar').fullCalendar('getView').name == 'month') {
								actualSince = ($.datepicker.parseDate('yy-mm-dd', $('tr.fc-week.fc-first td:eq(0)').attr('data-date')));
								actualUpon = ($.datepicker.parseDate('yy-mm-dd', $('tr.fc-week.fc-last td:eq(6)').attr('data-date')));
							} else if ($('#calendar').fullCalendar('getView').name == 'agendaWeek') {
								var headerTitle = $('.fc-header-title').text();
								actualSince = ($.datepicker.parseDate('M d', headerTitle.split('�')[0].trim()));
								if (!isNaN(parseInt(headerTitle.charAt(headerTitle.indexOf('�') + 2), 10))) {
									actualUpon = ($.datepicker.parseDate('M d', headerTitle.split('�')[0].substr(0, 4) + headerTitle.split('�')[1].substr(1, 1)));
								} else {
									actualUpon = ($.datepicker.parseDate('M d', headerTitle.split('�')[1].substr(1, headerTitle.lastIndexOf(' '))));
								}
							} else {
								var headerTitle = $('.fc-header-title').text();
								actualSince = ($.datepicker.parseDate('M d', headerTitle.split(',')[1].trim()));
								actualUpon = ($.datepicker.parseDate('M d', headerTitle.split(',')[1].trim()));
							}
							
							birthdays = EntityService.listByBirthDate(actualSince, actualUpon);
							appointments = AppointmentService.listAppointmentsByPeriod(actualSince,actualUpon);
							
							var contador = 0;
							if (birthdays) {
								for (var idx in birthdays) {
									var entity = birthdays[idx];
									var yearCurrent = $('#calendar').fullCalendar('getDate').getFullYear();
									var thisDate = new Date(yearCurrent, entity.birthDate['month'] -1, entity.birthDate['day']);
									contador = contador + 1;
									var event = {
										title: 'Anivers�rio de ' + entity.name,
										start: thisDate,
										allDay: true,
										color: $('.tag7').find('.tag-circle').css('background-color'),
										description: '',
										client: entity.name,
										type: 7,
										id: contador
									};
									events.push(event);
								}
							}
							if (appointments) 
							{
								for(var idx in appointments)
								{
									var app = appointments[idx];
									var nameEntity = "";
									contador = contador + 1;
									var entity = ArrayUtils.find($scope.contacts, 'uuid', app.contacts);
									if (entity) {
				                    	nameEntity = entity.name;
				                    }
										var event = {
												title: app.title,
												start: app.date,
												end: app.date,
												allDay: false,
												color: $('.tag'+app.type).find('.tag-circle').css('background-color'),
												description: app.description,
												client: nameEntity,
												type: app.type,
												id: contador,
												uuid: app.uuid
										};
										events.push(event);
									}
							}
							
							removerEventos();
							
							if(events)
							{
								for (var idx in events)
								{
									var event = events[idx];
									$('#calendar').fullCalendar('renderEvent', event, true);
								}
							}
							
						};
						
					function removerEventos()
						{
							$('#calendar').fullCalendar('removeEvents');
							var evts = $('#calendar').fullCalendar('clientEvents');
							for (var i = 0 ; i < evts.length ; i++) {
								$('#calendar').fullCalendar('removeEvents', evts[i].id);
							}
						}

						$scope.remove = function(appointment) {
							$scope.appointments.splice($scope.appointments.indexOf(appointment), 1);
						};

					

						
						$scope.done = function(appointmentToUpdate) 
						{
							var agree = confirm("Deseja confirmar a conclusão do evento?")
						
							if( agree )
							{
							   AppointmentService.done(appointmentToUpdate).then(function() {
								    alert('Evento Finalizado com sucesso!');
								   $scope.closeDialogUpdate();
								   $scope.rebuildCalendar();
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
							}
			               
						};

						$scope.cancel = function(appointmentToUpdate) 
						{
							var agree = confirm("Deseja confirmar o cancelamento do evento?")
							
							if( agree )
							{	
								AppointmentService.cancel(appointmentToUpdate).then(function() {
									   alert('Evento Cancelado com sucesso!');
									   $scope.closeDialogUpdate();
									   $scope.rebuildCalendar();
						            }, function(err) {
						            	alert('Erro: ' + err);
						            });
							}
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
							//$scope.prepareUpdate($scope.appointmentToUpdate);
							
							var hour = $("#select-hour-u").val();
							var minute = $("#select-minute-u").val();
							var time = hour+":"+minute;
							
							var calendarId = $("#calendar-id").val();
							
							
							//$scope.appointmentToUpdate.date = $scope.tempDate;
							$scope.appointmentToUpdate.startTime = time;
							$scope.appointmentToUpdate.endTime = time;
							$scope.appointmentToUpdate.allDay =  false;
							$scope.appointmentToUpdate.type = $("#select-event-u").val();
							$scope.appointmentToUpdate.color =  $('.tag' + $scope.appointmentToUpdate.type).find('.tag-circle').css('background-color');
							delete $scope.appointmentToUpdate.isValid;
							
							AppointmentService.update($scope.appointmentToUpdate).then(function(uuid) {
									$scope.closeDialogUpdate();
								   $scope.rebuildCalendar();
								
					               alert('Atualizacao efetuada com sucesso');
					              
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
		
						$scope.create = function ()	{
							if( !$scope.appointment )
								alert( 'Selecione um evento' )
							var hour = $("#select-hour").val();
							var minute = $("#select-minute").val();
							var time = hour+":"+minute;
							
							$scope.appointment.date = $scope.tempDate;
							$scope.appointment.startTime = time;
							$scope.appointment.endTime = time;
							$scope.appointment.status = 'PENDANT';
							$scope.appointment.allDay =  false;
							$scope.appointment.type = $("#select-event").val();
							$scope.appointment.color =  $('.tag' + $scope.appointment.type).find('.tag-circle').css('background-color');
							
							AppointmentService.create($scope.appointment).then(function(uuid) {
								alert('Evento cadastrado com sucesso');
							  $scope.closeDialog();
							  $scope.rebuildCalendar();
				            }, function(err) {
				            	alert('Erro. Verifique os seguintes campos: ' + err);
				            });
						};
					    
					});
}(angular));