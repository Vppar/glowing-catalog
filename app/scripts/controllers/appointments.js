(function(angular) {
	'use strict';
	angular.module('tnt.catalog.appointments.ctrl',
			[ 'tnt.catalog.appointments.service', 'tnt.utils.array' ])
			.controller(
					'AppointmentsCtrl',
					function($scope, $location, $filter, ArrayUtils, AppointmentService, EntityService, UserService) {

						// #############################################################################################################
						// Security for this Controller
						// #############################################################################################################
						UserService.redirectIfIsNotLoggedIn();

						// #############################################################################################################
						// Initialize variables
						// #############################################################################################################
						$scope.contador = 0;
						$scope.tempDate = undefined;
						$scope.contacts = undefined;
						$scope.appointments = [];						
						$scope.appointment = undefined;
						$scope.contacts = [];
						$scope.contacts = EntityService.list();

						// #############################################################################################################
						// Initialize/Rebuild Adam Shaw Full Calendar Component
						// #############################################################################################################
						$scope.rebuildCalendarJsGrid = function() {							
							
							$('#calendar').fullCalendar({
								
								buttonText: {
									prev: 'Ant.',
									next: 'Prox.',
									today: 'Hoje',
									month: 'M&#234;s',
									agendaWeek: 'Semana',
									agendaDay: 'Dia'
								},
								monthNames: ['Janeiro', 'Fevereiro', 'Mar&#231;o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
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
								editable: true,
								
								drop: function(date, allDay) { // funcao quando solta tag sobre calendario
									openEventDialog($(this).data('eventObject').eventType, date.getDate(), date.getHours(), date.getMinutes(), null, null, null);
								},
								
								select: function(start, end, allDay) { // quando clica em uma data/hora
									if(eventsInDay(start) > 0 && $('#calendar').fullCalendar('getView').name == 'month') {
										$('#calendar').fullCalendar('changeView', 'agendaDay');
										$('#calendar').fullCalendar('gotoDate', start);
									} else {
										openEventDialog(null, start, start.getHours(), start.getMinutes(), end.getHours(), end.getMinutes(), null);
									}
								},
								
								eventClick: function(event, jsEvent, view) {
									if(!event.allDay) {										
										openEventDialog(event.type, event.start, event.start.getHours(), event.start.getMinutes(), event.end.getHours(), event.end.getMinutes(), event);
									}
								},
								
								viewRender: function(view, element) {
									$scope.rebuildCalendarJsEvents();					
								},							

							});
						};	
						
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

						$scope.rebuildCalendarJsEvents = function () {

							var actualSince; 
							var actualUpon;
							var birthdays = [];
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
							
							$scope.appointments = AppointmentService.listAppointmentsByPeriod(actualSince,actualUpon);
							
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

							if ($scope.appointments) {
								for(var idx in $scope.appointments)
								{
									var app = $scope.appointments[idx];
									var nameEntity = "";
									contador = contador + 1;
									var entity = ArrayUtils.find($scope.contacts, 'uuid', app.contacts);
									if (entity) {
				                    	nameEntity = entity.name;
				                    }
										var event = {
												title: app.title,
												start: app.startDate,
												end: app.endDate,
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
							
							removeCalendarJsEvents();
							
							if(events)
							{
								for (var idx in events)
								{
									var event = events[idx];
									$('#calendar').fullCalendar('renderEvent', event, true);
								}
							}
							
						};

						function removeCalendarJsEvents() {
							$('#calendar').fullCalendar('removeEvents');
							var evts = $('#calendar').fullCalendar('clientEvents');
							for (var i = 0 ; i < evts.length ; i++) {
								$('#calendar').fullCalendar('removeEvents', evts[i].id);
							}
						}

						// #############################################################################################################
						// Methods of controller (appointments.html)
						// #############################################################################################################												
						function openEventDialog(eventType, date, startHours, startMinutes, endHours, endMinutes, client, title, desc, event) { 
							
							if(event && event.uuid) {
								$("#select-event-uuid").val(event.uuid);
							}

							if($('#calendar').fullCalendar('getView').name == 'month') {
								if (new Date().getHours() <= 22) {
									startHours += 2;
								}
							}

							if(date) {
								$("#select-date").val(date);
							}

							if(eventType) {
								$("#select-event-u").val(eventType);
								$("#select-event").val(eventType);
							} else {
								$("#select-event").val(0);
							}
							if(startHours) {
								$("#select-hour-initial").val(startHours);
								$("#select-hour-u-initial").val(startHours);
							} else {
								$("#select-hour-initial").val(8);
							}
							if(startMinutes) {
								$("#select-minute-initial").val(startMinutes);
								$("#select-minute-u-initial").val(startMinutes);
							} else {
								$("#select-minute-initial").val(0);
							}
							if(endHours) {
								$("#select-hour-end").val(endHours);
								$("#select-hour-u-end").val(endHours);
							} else {
								$("#select-hour-end").val(8);
							}
							if(endMinutes) {
								$("#select-minute-end").val(endMinutes);
								$("#select-minute-u-end").val(endMinutes);
							} else {
								$("#select-minute-end").val(0);
							}

							$("#select-client").val("");
							$("#txt-description").val("");
							$("#txt-title").val("");
							
							if(event) {
								if(event.title) {
									$("#txt-title").val(event.title);
								}
								if(event.desc) {
									$("#txt-description").val(event.desc);
								}
								if(event.client) {								
									$("#select-client").val(event.client);
								}
								
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
									title: "Alterar evento"
								});
							} else {
								$( "#dialog" ).dialog({
									modal: true,
									title: "Novo evento"
								});
							}							
						}

						$scope.closeEventDialog = function() { // fecha dialogo
							$("#select-event-uuid").val(null);
							$("#select-date").val(null);
							$("#dialog").dialog( "close" );
							$scope.appointment = undefined;
							$scope.rebuildCalendarJsEvents();							
						};				

						$scope.updateCalendar = function ()	{
							var actualSince; 
							var actualUpon; 
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
							
							$scope.birthdays = EntityService.listByBirthDate(actualSince, actualUpon);
							$scope.appointments = AppointmentService.listAppointmentsByPeriod(actualSince,actualUpon);
						};						

						$scope.remove = function() {
							if( confirm("Deseja confirmar a exclus�o do evento?") ){
							   AppointmentService.remove($("#select-event-uuid").val()).then(function() {
								   alert('Evento Removido com sucesso!');
								   $scope.closeEventDialog();								   
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
							}	
						};
						
						$scope.done = function() {						
							if( confirm("Deseja confirmar a conclus�o do evento?") ){
							   AppointmentService.done($("#select-event-uuid").val()).then(function() {
								   alert('Evento Finalizado com sucesso!');
								   $scope.closeEventDialog();								   
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
							}			               
						};

						$scope.cancel = function() {							
							if( confirm("Deseja confirmar o cancelamento do evento?") ) {	
								AppointmentService.cancel($("#select-event-uuid").val()).then(function() {
									   alert('Evento Cancelado com sucesso!');
									   $scope.closeEventDialog();									   
						            }, function(err) {
						            	alert('Erro: ' + err);
						        });
							}
						};						
						
						$scope.update = function() {
							if( $("#select-event").val() ) {
								alert( 'Selecione um tipo de evento.' );
							}
							
							var selectedStartDate = $("#select-date").val() + " " + $("#select-hour-initial").val() + ":" + $("#select-minute-initial").val();
							var selectedEndDate = $("#select-date").val() + " " + $("#select-hour-end").val() + ":" + $("#select-minute-end").val();
							
							$scope.appointment.uuid = $("#select-event-uuid").val();
							$scope.appointment.startDate = selectedStartDate;
							$scope.appointment.endDate = selectedEndDate;
							$scope.appointment.allDay =  false;
							$scope.appointment.type = $("#select-event").val();
							$scope.appointment.color =  $('.tag' + $scope.appointmentToUpdate.type).find('.tag-circle').css('background-color');
														
							AppointmentService.update($scope.appointment).then(function(uuid) {
								   $scope.closeEventDialog();								   								
					               alert('Atualizacao efetuada com sucesso.');					              
					            }, function(err) {
					            	alert('Erro:' + err);
					            });
						};		
		
						$scope.create = function ()	{
							if( $("#select-event").val() == "") {
								alert( 'Selecione um tipo de evento.' );
								return;
							}

							var selectedStartDate = new Date($("#select-date").val());
							selectedStartDate.setHours($("#select-hour-initial").val());
							selectedStartDate.setMinutes($("#select-minute-initial").val());
							
							var selectedEndDate = new Date($("#select-date").val());
							selectedEndDate.setHours($("#select-hour-end").val());
							selectedEndDate.setMinutes($("#select-minute-end").val());
							
							$scope.appointment = {};
							$scope.appointment.title = $("#txt-title").val();
							$scope.appointment.description = $("#txt-description").val();
							$scope.appointment.contacts = $("#select-client").val();
							$scope.appointment.startDate = selectedStartDate;
							$scope.appointment.endDate = selectedEndDate;
							$scope.appointment.status = 'PENDANT';
							$scope.appointment.allDay =  false;
							$scope.appointment.type = $("#select-event").val();
							$scope.appointment.color =  $('.tag' + $scope.appointment.type).find('.tag-circle').css('background-color');
							
							AppointmentService.create($scope.appointment).then(function(uuid) {
								alert('Evento cadastrado com sucesso.');
							    $scope.closeEventDialog();	
				            }, function(err) {
				            	alert('Erro. Verifique os seguintes campos: ' + err);
				            });
						};
					    
						// #############################################################################################################
						// Drag and Drop Adam Shaw Full Calendar Component
						// #############################################################################################################
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

						
					});

}(angular));