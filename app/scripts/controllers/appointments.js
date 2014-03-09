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
								disableDragging: true,
								eventDurationEditable: false,
								
								drop: function(date, allDay) {
									openEventDialog($(this).data('eventObject').eventType, date.getDate(), date.getHours(), date.getMinutes(), null, null, null);									
								},
								select: function(start, end, allDay) {
									if(eventsInDay(start) > 0 && ($('#calendar').fullCalendar('getView').name == 'month')) {
										$('#calendar').fullCalendar('changeView', 'agendaDay');
										$('#calendar').fullCalendar('gotoDate', start);
									} else {				
										var initialHours = start.getHours();
										var endHours = end.getHours();
										if(($('#calendar').fullCalendar('getView').name == 'month'))
										{
											initialHours = new Date().getHours();
											endHours = initialHours;
											if(initialHours < 21) {
												initialHours = initialHours+2;
												endHours = endHours + 3;
											}
										}
										openEventDialog(null, start, initialHours, start.getMinutes(), endHours, end.getMinutes(), null);
									}
								},
								
								eventClick: function(event, jsEvent, view) {
									if(($('#calendar').fullCalendar('getView').name == 'month')) {
										$('#calendar').fullCalendar('changeView', 'agendaDay');
										$('#calendar').fullCalendar('gotoDate', event.start);
									} else {
										if(!event.allDay) {										
											openEventDialog(event.type, event.start, event.start.getHours(), event.start.getMinutes(), event.end.getHours(), event.end.getMinutes(), event);
										}
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
								actualSince = ($.datepicker.parseDate('M d yy', headerTitle.split('—')[0] + headerTitle.split('—')[1].substr(headerTitle.split('—')[1].lastIndexOf(' ') + 1, 10)))
								if (!isNaN(parseInt(headerTitle.charAt(headerTitle.indexOf('—') + 2), 10))) {
									actualUpon = ($.datepicker.parseDate('M d yy', headerTitle.split('—')[0].substr(0, 3) + headerTitle.split('—')[1]))
								} else {
									actualUpon = ($.datepicker.parseDate('M d yy', headerTitle.split('—')[1].substr(1, headerTitle.lastIndexOf(' '))))
								}
							} else {
								var headerTitle = $('.fc-header-title').text();
								actualSince = ($.datepicker.parseDate('M d, yy', headerTitle.substr(headerTitle.indexOf(',') + 1, headerTitle.length).trim()));
								actualUpon = ($.datepicker.parseDate('M d, yy', headerTitle.substr(headerTitle.indexOf(',') + 1, headerTitle.length).trim()));
							}
							
							birthdays = EntityService.listByBirthDate(actualSince, actualUpon);
							
							$scope.appointments = AppointmentService.listAppointmentsByPeriod(actualSince,actualUpon, null);

							var contador = 0;
							if (birthdays) {
								for (var idx in birthdays) {
									var entity = birthdays[idx];
									var yearCurrent = $('#calendar').fullCalendar('getDate').getFullYear();
									var thisDate = new Date(yearCurrent, entity.birthDate['month'] -1, entity.birthDate['day']);
									contador = contador + 1;
									var event = {
										title: 'Anivers&#225;rio de ' + entity.name,
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
												status: app.status,
												color: $('.tag'+app.type).find('.tag-circle').css('background-color'),
												description: app.description,
												client: nameEntity,
												clientUUID: app.contacts,
												type: app.type,
												id: contador,
												uuid: app.uuid
										};
										events.push(event);
									}
							}
							
							removeCalendarJsEvents();
							
							if(events) {
								for (var idx in events) {
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
						// Controller methods (appointments.html)
						// #############################################################################################################												
						function openEventDialog(eventType, date, startHours, startMinutes, endHours, endMinutes, event) { 
							
							$("#select-hour-end").val(0);
							$("#select-minute-end").val(0);							

							if(date) {
								$("#select-date").val(date);
							}

							if(eventType) {
								$("#select-event").val(eventType);
							} else {
								$("#select-event").val(0);
							}
							
							if(startHours) {
								$("#select-hour-initial").val(startHours);
							} else {
								$("#select-hour-initial").val(8);
							}
							
							if(startMinutes) {
								$("#select-minute-initial").val(startMinutes);
							} else {
								$("#select-minute-initial").val(0);
							}
							if(!endHours) {
								if( !endMinutes && startMinutes == 30 )	{
									$("#select-hour-end").val(startHours+1);
									$("#select-minute-end").val(0);
								}
								else if( !endMinutes ) {
									$("#select-hour-end").val(startHours);
									$("#select-minute-end").val(startMinutes+30);
								}									
							}
							else if(endHours) {
								$("#select-hour-end").val(endHours);							
							} else {
								$("#select-hour-end").val(8);
							}

							if(endMinutes) {
								$("#select-minute-end").val(endMinutes);
							} 

							$("#select-client").val("");
							$("#txt-description").val("");
							$("#txt-title").val("");

							$("#btn-salvar").removeClass('hide');
							$("#event-status").val("");
							$("#btn-alterar").addClass('hide');
							$("#btn-concluir").addClass('hide');
							$("#btn-cancelar").addClass('hide');
							$("#btn-excluir").addClass('hide');
							
							if(event) {

								$("#select-event-uuid").val(event.uuid);

								$("#event-status").val(event.status);

								if(event.title) {
									$("#txt-title").val(event.title);
								}
								if(event.description) {
									$("#txt-description").val(event.description);
								}
								if(event.client) {								
									$("#select-client").val(event.clientUUID);
								}	

								if(event.status=='CANCELLED' || event.status=='DONE')
								{								
									$("#btn-salvar").addClass('hide');
								} else {
									$("#btn-alterar").removeClass('hide');
									$("#btn-concluir").removeClass('hide');
									$("#btn-cancelar").removeClass('hide');
									$("#btn-excluir").removeClass('hide');
									$("#btn-salvar").addClass('hide');
								}								
								
								$("#event-dialog").dialog({
									modal: true,
									title: "Alterar evento"
								});
							} else {
								$( "#event-dialog" ).dialog({
									modal: true,
									title: "Novo evento"
								});
							}							
						}

						$scope.closeEventDialog = function() {
							$("#select-hour-end").val(0);
							$("#select-minute-end").val(0);
							$("#event-status").val("");
							$("#select-client").val("");
							$("#txt-description").val("");
							$("#txt-title").val("");
							$("#select-event-uuid").val(null);
							$("#select-date").val(null);
							$("#event-dialog").dialog( "close" );
							$scope.appointment = undefined;
							$scope.rebuildCalendarJsEvents();							
						};				

						$scope.remove = function() {
							if( confirm("Deseja confirmar a exclus&#227;o do evento?") ){
								$scope.validateUUID();
							    AppointmentService.remove($("#select-event-uuid").val()).then(function() {
								   alert('Evento Removido com sucesso!');
								   $scope.closeEventDialog();								   
					            }, function(err) {
					            	alert('Erro: ' + err);
					            });
							}	
						};
						
						$scope.done = function() {						
							if( confirm("Deseja confirmar a conclus&#227;o do evento?") ){
								$scope.validateUUID();
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
								$scope.validateUUID();
								AppointmentService.cancel($("#select-event-uuid").val()).then(function() {
									   alert('Evento Cancelado com sucesso!');
									   $scope.closeEventDialog();									   
						            }, function(err) {
						            	alert('Erro: ' + err);
						        });
							}
						};						
						
						$scope.update = function() {							
							
							if($scope.validateUUID() && $scope.validateEventDialogFields()) {

								var selectedStartDate = new Date($("#select-date").val());
								selectedStartDate.setHours($("#select-hour-initial").val());
								selectedStartDate.setMinutes($("#select-minute-initial").val());
								
								var selectedEndDate = new Date($("#select-date").val());
								selectedEndDate.setHours($("#select-hour-end").val());
								selectedEndDate.setMinutes($("#select-minute-end").val());		

								$scope.appointment = AppointmentService.loadByUUID( $("#select-event-uuid").val());
								$scope.appointment.contacts = $("#select-client").val();
								$scope.appointment.title = $("#txt-title").val();
								$scope.appointment.description = $("#txt-description").val();
								$scope.appointment.startDate = selectedStartDate;
								$scope.appointment.endDate = selectedEndDate;
								$scope.appointment.allDay =  false;
								$scope.appointment.status = $("#event-status").val();
								$scope.appointment.type = $("#select-event").val();
								$scope.appointment.color =  $('.tag' + $("#select-event").val()).find('.tag-circle').css('background-color');
																
								AppointmentService.update($scope.appointment).then(function(uuid) {
									   $scope.closeEventDialog();								   								
						               alert('Atualiza&#231;&#227;o efetuada com sucesso.');					              
						            }, function(err) {
						            	alert('Erro:' + err);
						        });
							}
						};		
		
						$scope.create = function ()	{
							if($scope.validateEventDialogFields()) {

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
								$scope.appointment.color =  $('.tag' + $("#select-event").val()).find('.tag-circle').css('background-color');
								
								AppointmentService.create($scope.appointment).then(function(uuid) {
									alert('Evento cadastrado com sucesso.');
								    $scope.closeEventDialog();	
					            }, function(err) {
					            	alert('Erro. Verifique os seguintes campos: ' + err);
					            });
							}
						};						

						$scope.validateUUID = function ()	{
							if( !$("#select-event-uuid").val() ) {
								alert('UUID do Evento &#233; um campo obrigat&#243;rio.');
								return false;
							}
							return true;						
						};

						$scope.validateEventDialogFields = function ()	{							
							if( !$("#select-date").val() ) {
								alert('A data do evento &#233; um campo obrigat&#243;rio.');
								return false;
							}	
							if( !$("#select-client").val() ) {
								alert('O contato do evento &#233; um campo obrigat&#243;rio.');
								return false;
							}	
							if( !$("#txt-title").val() ) {
								alert('O t&#237;tulo do evento &#233; um campo obrigat&#243;rio.');
								return false;
							}
							if( !$("#txt-description").val() ) {
								alert('A descri&#231;&#227;o do evento &#233; um campo obrigat&#243;rio.');
								return false;
							}							
							if( !$("#select-event").val() ) {
								alert('O tipo do evento &#233; um campo obrigat&#243;rio.');
								return false;
							}	
							return true;
						};
					    
						// #############################################################################################################
						// Drag and Drop Adam Shaw Full Calendar Component
						// #############################################################################################################
						$('.external-event').each(function() {
								
							var id = $(this).attr("id");
							id = id.replace("tagEvent","");

							var eventObject = {
								eventType: id
							};
							
							$(this).data('eventObject', eventObject);
							
							$(this).draggable({
								zIndex: 999,
								revert: true,
								revertDuration: 0 
							});					
						});						
					});
}(angular));