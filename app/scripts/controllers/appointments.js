(function ($, angular, alert, confirm, unescape) {
    'use strict';
    angular
        .module('tnt.catalog.appointments.ctrl', [
            'tnt.catalog.appointments.service', 'tnt.utils.array'
        ])
        .controller(
            'AppointmentsCtrl',
            function ($scope, $location, $filter, ArrayUtils, AppointmentService, EntityService,
                UserService,DialogService) {

                // #############################################################################################################
                // Security for this Controller
                // #############################################################################################################
                UserService.redirectIfInvalidUser();

                // #############################################################################################################
                // Initialize variables
                // #############################################################################################################
                $scope.contador = 0;
                $scope.tempDate = undefined;
                $scope.contacts = undefined;
                $scope.appointments = [];
                $scope.appointment = undefined;

                $scope.filter = [];
                $.datepicker.regional.pt =
                    {
                        closeText : 'Fechar',
                        prevText : 'Anterior',
                        nextText : 'Seguinte',
                        currentText : 'Hoje',
                        monthNames : [
                            'Janeiro',
                            'Fevereiro',
                            'Mar&ccedil;o',
                            'Abril',
                            'Maio',
                            'Junho',
                            'Julho',
                            'Agosto',
                            'Setembro',
                            'Outubro',
                            'Novembro',
                            'Dezembro'
                        ],
                        monthNamesShort : [
                            'Jan',
                            'Fev',
                            'Mar',
                            'Abr',
                            'Mai',
                            'Jun',
                            'Jul',
                            'Ago',
                            'Set',
                            'Out',
                            'Nov',
                            'Dez'
                        ],
                        dayNames : [
                            'Domingo',
                            'Segunda-feira',
                            'Ter&ccedil;a-feira',
                            'Quarta-feira',
                            'Quinta-feira',
                            'Sexta-feira',
                            'S&aacute;bado'
                        ],
                        dayNamesShort : [
                            'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b'
                        ],
                        dayNamesMin : [
                            'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b'
                        ],
                        weekHeader : 'Sem',
                        dateFormat : 'dd/mm/yy',
                        firstDay : 0,
                        isRTL : false,
                        showMonthAfterYear : false,
                        yearSuffix : ''
                    };
                $.datepicker.setDefaults($.datepicker.regional.pt);

                $scope.filterEvents = function ($event) {

                        var element = $event.target;
                        var circleElement =
                            $(element).attr('class') === 'tag-name' ? $(element).prev()
                                : $(element).attr('id') !== undefined ? $(element).find(
                                    'div[class*="tag-circle"]') : $(element);
                        var circleCss = $(circleElement).attr('class');
                        if ($(circleElement).parent().attr('id') !== 'tagEvent0' ||
                            $(circleElement).attr('class').indexOf('tag-circle-selected') < 0) {
                            $(circleElement).attr('class', circleCss.indexOf('tag-circle-selected') < 0 ? 'tag-circle-selected' : 'tag-circle');
                        }
                        var tagNumber = $(circleElement).parent().attr('id').replace('tagEvent', '');
                        if (tagNumber !== '0') {
                            if (circleCss.indexOf('tag-circle-selected') < 0) {
                                $scope.filter.push(tagNumber);
                            } else {
                                $scope.filter.splice($scope.filter.indexOf(tagNumber), 1);
                            }
                            if ($scope.filter.length > 0) {
                                $('div[id=tagEvent0]').find('div[class*="tag-circle"]').attr('class', 'tag-circle');
                            } else {
                                $('div[id=tagEvent0]').find('div[class*="tag-circle"]').attr('class', 'tag-circle-selected');
                                $scope.filter = [];
                            }
                        } else {
                            $scope.filter = [];
                            $.each($('div[id*=tagEvent]'), function () {
                                if ($(this).attr('id') !== 'tagEvent0') {
                                    $(this).find('div[class*="tag-circle"]').attr('class', 'tag-circle');
                                }
                            });
                        }
                        $scope.rebuildCalendarJsEvents();
                    };

                // #############################################################################################################
                // Initialize/Rebuild Adam Shaw Full Calendar Component
                // #############################################################################################################
                $scope.rebuildCalendarJsGrid =
                    function () {
                        $scope.contacts = EntityService.list();
                        $('#calendar')
                        .fullCalendar(
                            {
                                buttonText : {
                                    prev : 'Ant.',
                                    next : 'Prox.',
                                    today : 'Hoje',
                                    month : 'M&ecirc;s',
                                    agendaWeek : 'Semana',
                                    agendaDay : 'Dia'
                                },
                                monthNames : [
                                    'Janeiro',
                                    'Fevereiro',
                                    'Mar&ccedil;o',
                                    'Abril',
                                    'Maio',
                                    'Junho',
                                    'Julho',
                                    'Agosto',
                                    'Setembro',
                                    'Outubro',
                                    'Novembro',
                                    'Dezembro'
                                ],
                                monthNamesShort : [
                                    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                                ],
                                dayNames : [
                                    'Domingo', 'Segunda', 'Ter&ccedil;a', 'Quarta', 'Quinta', 'Sexta', 'S&aacute;bado'
                                ],
                                dayNamesShort : [
                                    'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b'
                                ],
                                titleFormat : {
                                    day : 'dddd, d \'de\' MMMM \'de\' yyyy'
                                },
                                columnFormat : {
                                    week : 'ddd d/M',
                                    day : 'dddd d/M'
                                },
                                header : {
                                    left : 'today',
                                    center : 'prev,title,next',
                                    right : 'agendaDay,agendaWeek,month'
                                },
                                height: 480,
                                allDayText : 'dia inteiro',
                                axisFormat : 'H:mm',
                                selectable : true,
                                selectHelper : true,
                                droppable : true,
                                editable : true,
                                disableDragging : true,
                                eventDurationEditable : false,

                                drop : function (date) {
                                    if (date < getActualDate()) {
                                        DialogService.messageDialog({
                                            title : 'Agenda',
                                            message : 'N'+unescape('%e3')+'o '+unescape('%e9')+' permitido cadastrar eventos anteriores a data/hora atual.',
                                            btnYes : 'OK',
                                        });
                                    } else {
                                        openEventDialog($(this).data('eventObject').eventType, date.getDate(), date.getHours(), date.getMinutes(), null, null, null);
                                    }
                                },
                                select : function (start, end) {
                                    if (eventsInDay(start) > 0 && ($('#calendar').fullCalendar('getView').name === 'month')) {
                                        $('#calendar').fullCalendar('changeView', 'agendaDay');
                                        $('#calendar').fullCalendar('gotoDate', start);
                                    } else {
                                        if (start >= getActualDate()) {
                                            if (($('#calendar').fullCalendar('getView').name === 'month')) {

                                                var actualStartHours = new Date().getHours();
                                                var initialHours = '';
                                                var endHours = '';
                                                
                                                if (actualStartHours < 21) {
                                                    initialHours = actualStartHours + 2;
                                                    endHours = actualStartHours + 3;
                                                } else if(actualStartHours < 23) {
                                                    initialHours = actualStartHours;
                                                    endHours = actualStartHours + 1;
                                                } else {
                                                    initialHours = actualStartHours;
                                                    endHours = '00';
                                                }

                                                openEventDialog(null, start, initialHours, '00', endHours, '00', null);
                                            } else {
                                                openEventDialog(null, start, start.getHours(), start.getMinutes(), end.getHours(), end.getMinutes(), null);
                                            }
                                        } else {
                                            DialogService.messageDialog({
                                                title : 'Agenda',
                                                message : 'N'+unescape('%e3')+'o '+unescape('%e9')+' permitido cadastrar eventos anteriores a data/hora atual.',
                                                btnYes : 'OK'
                                            });
                                        }
                                    }
                                },

                                eventClick : function (event) {
                                    if (($('#calendar').fullCalendar('getView').name === 'month')) {
                                        $('#calendar').fullCalendar('changeView', 'agendaDay');
                                        $('#calendar').fullCalendar('gotoDate', event.start);
                                    } else {
                                        if (!event.allDay) {
                                            openEventDialog(
                                                event.type,
                                                event.start,
                                                event.start.getHours(),
                                                event.start.getMinutes(),
                                                event.end.getHours(),
                                                event.end.getMinutes(),
                                                event);
                                        }
                                    }
                                },

                                viewRender : function () {
                                    $scope.rebuildCalendarJsEvents();
                                },

                                eventAfterAllRender : function () {
                                    if ($('#calendar').fullCalendar('getView').name !== 'month') {
                                        $.each($('.fc-event'), function () {
                                            $(this).css('width', 'auto');
                                            if ($(this).parent().next().prop('tagName') === 'TABLE' &&
                                                $(this).parent().next().attr('class') === 'fc-agenda-allday') {
                                                $(this).css('min-width', '260px');
                                            }
                                        });
                                    }
                                }
                            });
                    };
                    
                function getActualDate() {
                    var actualDate = new Date();
                    actualDate.setHours(0);
                    actualDate.setMinutes(0);
                    actualDate.setSeconds(0);
                    actualDate.setMilliseconds(0);
                    return actualDate;
                }
                    
                function eventsInDay (date) {
                    var evts = $('#calendar').fullCalendar('clientEvents');
                    var count = 0;
                    for ( var i = 0; i < evts.length; i++) {
                        if (evts[i].start.getDate() === date.getDate() &&
                            evts[i].start.getMonth() === date.getMonth() &&
                            evts[i].start.getFullYear() === date.getFullYear()) {
                            count++;
                        }
                    }
                    return count;
                }

                $scope.rebuildCalendarJsEvents =
                    function () {

                        var actualSince;
                        var actualUpon;
                        var birthdays = [];
                        var events = [];
                        var headerTitle = '';

                        $scope.contacts = EntityService.list();

                        if ($('#calendar').fullCalendar('getView').name === 'month') {
                            $('.fc-sat.fc-widget-header').html( $('.fc-sat.fc-widget-header').text().replace('&aacute;', '&#225;'));
                            actualSince = ($.datepicker.parseDate('yy-mm-dd', $( 'tr.fc-week.fc-first td:eq(0)').attr('data-date')));
                            actualUpon =($.datepicker.parseDate('yy-mm-dd', $('tr.fc-week.fc-last td:eq(6)').attr('data-date')));
                        } else if ($('#calendar').fullCalendar('getView').name === 'agendaWeek') {
                            $('.fc-sat.fc-widget-header').html(
                                $('.fc-sat.fc-widget-header').text().replace('&aacute;', '&#225;'));
                            headerTitle = $('.fc-header-title').text().split(' ');
                            actualSince =($.datepicker.parseDate('M d yy', headerTitle[0] + ' ' + headerTitle[1] + ' ' + headerTitle[headerTitle.length - 1]));
                            if (!isNaN(parseInt(headerTitle[3], 10))) {
                                actualUpon = ($.datepicker.parseDate('M d yy', headerTitle[0] + ' ' + headerTitle[3] + ' ' + headerTitle[4]));
                            } else if (headerTitle.length === 6) {
                                actualUpon = ($.datepicker.parseDate('M d yy', headerTitle[3] + ' ' + headerTitle[4] + ' ' + headerTitle[5]));
                            } else {
                                actualSince = ($.datepicker.parseDate('M d yy', headerTitle[0] + ' ' + headerTitle[1] + ' ' + headerTitle[2]));
                                actualUpon = ($.datepicker.parseDate('M d yy', headerTitle[4] + ' ' + headerTitle[5] + ' ' + headerTitle[6]));
                            }
                        } else {
                            $('.fc-tue.fc-widget-header').html($('.fc-tue.fc-widget-header').text().replace('&ccedil;', '&#231;'));
                            $('.fc-sat.fc-widget-header').html($('.fc-sat.fc-widget-header').text().replace('&aacute;', '&#225;'));
                            headerTitle = $('.fc-header-title').text().split(' de ');
                            actualSince =($.datepicker.parseDate('M d, yy', headerTitle[1].substr(0, 3) + ' ' + headerTitle[0].substr(headerTitle[0].indexOf(',') + 2, headerTitle[0].length) + ', ' + headerTitle[2].trim()));
                            actualUpon =($.datepicker.parseDate('M d, yy', headerTitle[1].substr(0, 3) + ' ' + headerTitle[0].substr(headerTitle[0].indexOf(',') + 2, headerTitle[0].length) + ', ' + headerTitle[2].trim()));
                        }

                        birthdays = undefined;
                        if ($scope.filter.length === 0 || $scope.filter.indexOf('7') >= 0) {
                            birthdays = EntityService.listByBirthDate(actualSince, actualUpon);
                        }

                        $scope.appointments =
                            AppointmentService.listAppointmentsByPeriod(
                                actualSince,
                                actualUpon,
                                $scope.filter.length > 0 ? $scope.filter : null);
                        var entity = '';
                        var typeCircle = '';
                        var event = '';

                        var contador = 0;
                        if (birthdays) {
                            for ( var idx in birthdays) {
                                entity = birthdays[idx];
                                var yearCurrent =
                                    $('#calendar').fullCalendar('getDate').getFullYear();
                                var thisDate =
                                    new Date(
                                        yearCurrent,
                                        entity.birthDate.month - 1,
                                        entity.birthDate.day);
                                contador = contador + 1;
                                typeCircle = $('.tag7').find('div[class*="tag-circle"]');
                                event =
                                    {
                                        title : 'Anivers' + unescape('%E1') + 'rio de ' +
                                            entity.name,
                                        start : thisDate,
                                        allDay : true,
                                        color : typeCircle.attr('class').indexOf(
                                            'tag-circle-selected') >= 0 ? typeCircle
                                            .css('background-color') : typeCircle
                                            .css('border-color'),
                                        description : '',
                                        client : entity.name,
                                        type : 7,
                                        id : contador
                                    };
                                events.push(event);
                            }
                        }

                        if ($scope.appointments) {
                            for ( var idx2 in $scope.appointments) {
                                var app = $scope.appointments[idx2];
                                var nameEntity = '';
                                contador = contador + 1;
                                entity = ArrayUtils.find($scope.contacts, 'uuid', app.contacts);
                                if (entity) {
                                    nameEntity = entity.name;
                                }
                                typeCircle = $('.tag' + app.type).find('div[class*="tag-circle"]');
                                event =
                                    {
                                        title : app.title,
                                        start : new Date(app.startDate),
                                        end : new Date(app.endDate),
                                        allDay : false,
                                        status : app.status,
                                        color : typeCircle.attr('class').indexOf(
                                            'tag-circle-selected') >= 0 ? typeCircle
                                            .css('background-color') : typeCircle
                                            .css('border-color'),
                                        description : app.description,
                                        client : nameEntity,
                                        clientUUID : app.contacts,
                                        type : app.type,
                                        id : contador,
                                        uuid : app.uuid
                                    };
                                events.push(event);
                            }
                        }

                        removeCalendarJsEvents();

                        if (events) {
                            for ( var idx3 in events) {
                                event = events[idx3];
                                $('#calendar').fullCalendar('renderEvent', event, true);
                            }
                        }

                    };

                function removeCalendarJsEvents () {
                    $('#calendar').fullCalendar('removeEvents');
                    var evts = $('#calendar').fullCalendar('clientEvents');
                    for ( var i = 0; i < evts.length; i++) {
                        $('#calendar').fullCalendar('removeEvents', evts[i].id);
                    }
                }

                // #############################################################################################################
                // Controller methods (appointments.html)
                // #############################################################################################################
                function openEventDialog (eventType, date, startHours, startMinutes, endHours, endMinutes, event) {

                    $('#select-date').val(date);

                    if (eventType) {
                        $('#select-event').val(eventType);
                    } else {
                        $('#select-event').val('');
                    }

                    if (startHours) {
                        $('#select-hour-initial').val(startHours);
                    } else {
                        $('#select-hour-initial').val(8);
                    }

                    if (startMinutes) {
                        $('#select-minute-initial').val(startMinutes);
                    } else {
                        $('#select-minute-initial').val('00');
                    }

                    if (endHours) {
                        $('#select-hour-end').val(endHours);
                    } else {
                        $('#select-hour-end').val(9);
                    }

                    if (endMinutes) {
                        $('#select-minute-end').val(endMinutes);
                    } else {
                        $('#select-minute-end').val('00');
                    }

                    $('#select-client').val('');
                    $('#txt-description').val('');
                    $('#txt-title').val('');

                    $('#btn-salvar').removeClass('hide');
                    $('#btn-alterar').addClass('hide');
                    $('#btn-concluir').addClass('hide');
                    $('#btn-cancelar').addClass('hide');
                    $('#btn-excluir').addClass('hide');
                    $('#event-status').attr('type', 'hidden');
                    
                    $('#select-client').children().remove();
					$('#select-client').append('<option value="">Selecione o Cliente</option>');
					for ( var i in $scope.contacts) {
						$('#select-client').append('<option value="' + $scope.contacts[i].uuid + '">' + $scope.contacts[i].name + '</option>');
					}
                    
                    if (event) {
                        $('#select-event-uuid').val(event.uuid);

                        if(event.status === 'PENDANT') {
                            $('#event-status').attr('type', 'hidden');
                        } else {
                            $('#event-status').attr('type', 'text');
                            $('#event-status').val(event.status === 'CANCELLED' ? 'CANCELADO' : event.status === 'DONE' ? 'FINALIZADO' : event.status === 'REMOVED' ? 'REMOVIDO' : '');
                        }

                        if (event.title) {
                            $('#txt-title').val(event.title);
                        }
                        if (event.description) {
                            $('#txt-description').val(event.description);
                        }
                        if (event.client) {
                            $('#select-client').val(event.clientUUID);
                        }

                        if (event.status === 'CANCELLED' || event.status === 'DONE') {
                            $('#btn-salvar').addClass('hide');
                        } else {
                            if (event.end >= new Date()) {
                                $('#btn-alterar').removeClass('hide');
                            }
                            $('#btn-concluir').removeClass('hide');
                            $('#btn-cancelar').removeClass('hide');
                            $('#btn-excluir').removeClass('hide');
                            $('#btn-salvar').addClass('hide');
                        }

                        $('#event-dialog').dialog({
                            modal : true,
                            title : 'Alterar evento'
                        });
                    } else {
                        $('#event-dialog').dialog({
                            modal : true,
                            title : 'Novo evento'
                        });
                    }
                }

                $scope.closeEventDialog = function () {
                    $('#select-hour-end').val(0);
                    $('#select-minute-end').val(0);
                    $('#event-status').val('');
                    $('#select-client').val('');
                    $('#txt-description').val('');
                    $('#txt-title').val('');
                    $('#select-event-uuid').val(null);
                    $('#select-date').val(null);
                    $('#event-dialog').dialog('close');
                    $scope.appointment = undefined;
                    $scope.rebuildCalendarJsEvents();
                };

                $scope.remove = function () {
                    var result = DialogService.messageDialog({
                        title : 'Agenda',
                        message : 'Deseja confirmar a exclus'+unescape('%e3')+'o do evento?',
                        btnYes : 'Sim',
                        btnNo : 'N'+unescape('%e3')+'o'
                    });
                    result.then(function(result) {
                        if (result) {
                            $scope.validateUUID();
                            AppointmentService.remove($('#select-event-uuid').val()).then(function () {
                                $scope.closeEventDialog();
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Evento Removido com sucesso!',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Erro: ' + err,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    });
                    
                };

                $scope.done = function () {
                    var result = DialogService.messageDialog({
                        title : 'Agenda',
                        message : 'Deseja confirmar a conclus'+unescape('%e3')+'o do evento?',
                        btnYes : 'Sim',
                        btnNo : 'N'+unescape('%e3')+'o'
                    });
                    result.then(function(result) {
                        if (result) {
                            $scope.validateUUID();
                            AppointmentService.done($('#select-event-uuid').val()).then(function () {
                                $scope.closeEventDialog();
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Evento finalizado com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Erro: ' + err,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    });
                };

                $scope.cancel = function () {
                    var result = DialogService.messageDialog({
                        title : 'Agenda',
                        message : 'Deseja confirmar o cancelamento do evento?',
                        btnYes : 'Sim',
                        btnNo : 'N'+unescape('%e3')+'o'
                    });
                    result.then(function(result) {
                        if (result) {
                            $scope.validateUUID();
                            AppointmentService.cancel($('#select-event-uuid').val()).then(function () {
                                $scope.closeEventDialog();
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Evento cancelado com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Erro: ' + err,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    });
                };

                $scope.update = function () {

                        var selectedStartDate = new Date($('#select-date').val());
                        selectedStartDate.setHours($('#select-hour-initial').val());
                        selectedStartDate.setMinutes($('#select-minute-initial').val());

                        var selectedEndDate = new Date($('#select-date').val());
                        selectedEndDate.setHours($('#select-hour-end').val());
                        selectedEndDate.setMinutes($('#select-minute-end').val());

                        if ($scope.validateUUID() && $scope.validateEventDialogFields(selectedStartDate, selectedEndDate)) {
                            $scope.appointment = AppointmentService.loadByUUID($('#select-event-uuid').val());
                            $scope.appointment.contacts = $('#select-client').val();
                            $scope.appointment.title = $('#txt-title').val();
                            $scope.appointment.description = $('#txt-description').val();
                            $scope.appointment.startDate = selectedStartDate;
                            $scope.appointment.endDate = selectedEndDate;
                            $scope.appointment.allDay = false;
                            $scope.appointment.status = 'PENDANT';
                            $scope.appointment.type = $('#select-event').val();
                            $scope.appointment.color = $('.tag' + $('#select-event').val()).find('.tag-circle').css('background-color');

                            AppointmentService.update($scope.appointment).then(function () {
                                $scope.closeEventDialog();
                                DialogService
                                .messageDialog({
                                    title : 'Agenda',
                                    message : 'Atualiza'+unescape('%e7')+unescape('%e3')+'o efetuada com sucesso.',
                                    btnYes : 'OK'
                                });
                            }, function (err) {
                                var message = 'Erro. Verifique os seguintes campos: ' + err;
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : message,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    };

                $scope.create =
                    function () {
                        var selectedStartDate = new Date($('#select-date').val());
                        selectedStartDate.setHours($('#select-hour-initial').val());
                        selectedStartDate.setMinutes($('#select-minute-initial').val());

                        var selectedEndDate = new Date($('#select-date').val());
                        selectedEndDate.setHours($('#select-hour-end').val());
                        selectedEndDate.setMinutes($('#select-minute-end').val());

                        if ($scope.validateEventDialogFields(selectedStartDate, selectedEndDate)) {
                            $scope.appointment = {};
                            $scope.appointment.title = $('#txt-title').val();
                            $scope.appointment.description = $('#txt-description').val();
                            $scope.appointment.contacts = $('#select-client').val();
                            $scope.appointment.startDate = selectedStartDate;
                            $scope.appointment.endDate = selectedEndDate;
                            $scope.appointment.status = 'PENDANT';
                            $scope.appointment.allDay = false;
                            $scope.appointment.type = $('#select-event').val();
                            $scope.appointment.color =  $('.tag' + $('#select-event').val()).find('.tag-circle').css('background-color');

                            AppointmentService.create($scope.appointment).then(function () {
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : 'Evento cadastrado com sucesso.',
                                    btnYes : 'OK'
                                });
                                $scope.closeEventDialog();
                            }, function (err) {
                                var message = 'Erro. Verifique os seguintes campos: ' + err;
                                DialogService.messageDialog({
                                    title : 'Agenda',
                                    message : message,
                                    btnYes : 'OK'
                                });
                            });
                        }
                    };

                $scope.validateUUID = function () {
                    if (!$('#select-event-uuid').val()) {
                        DialogService.messageDialog({
                            title : 'Agenda',
                            message : 'UUID do Evento '+unescape('%e9')+' um campo obrigat'+unescape('%f3')+'rio.',
                            btnYes : 'OK'
                        });
                        return false;
                    }
                    return true;
                };

                $scope.validateEventDialogFields =
                    function (selectedStartDate, selectedEndDate) {
                        if (!$('#select-date').val()) {
                            DialogService.messageDialog({
                                title : 'Agenda',
                                message : 'A data do evento ' + unescape('%e9') + ' um campo obrigat' +
                                unescape('%f3') + 'rio.',
                                btnYes : 'OK'
                            });
                            return false;
                        }
                        if (!$('#select-client').val()) {
                            DialogService.messageDialog({
                                title : 'Agenda',
                                message : 'O contato do evento ' + unescape('%e9') + ' um campo obrigat' +
                                unescape('%f3') + 'rio.',
                                btnYes : 'OK'
                            });
                            return false;
                        }

                        if (!validateDate(selectedStartDate, selectedEndDate)) {
                            return false;
                        }

                        if (!$('#txt-title').val()) {
                            DialogService.messageDialog({
                                title : 'Agenda',
                                message : 'O t' + unescape('%ed') + 'tulo do evento ' + unescape('%e9') +
                                ' um campo obrigat' + unescape('%f3') + 'rio.',
                                btnYes : 'OK'
                            });
                            return false;
                        }
                        if (!$('#txt-description').val()) {
                            DialogService.messageDialog({
                                title : 'Agenda',
                                message : 'A descri' + unescape('%e7') + unescape('%e3') + 'o do evento ' +
                                unescape('%e9') + ' um campo obrigat' + unescape('%f3') + 'rio.',
                                btnYes : 'OK'
                            });
                            return false;
                        }
                        if (!$('#select-event').val()) {
                            DialogService.messageDialog({
                                title : 'Agenda',
                                message : 'O tipo do evento ' + unescape('%e9') + ' um campo obrigat' +
                                unescape('%f3') + 'rio.',
                                btnYes : 'OK'
                            });
                            return false;
                        }
                        return true;
                    };

                function validateDate (selectedStartDate, selectedEndDate) {
                    if (selectedStartDate < new Date()) {
                        DialogService.messageDialog({
                            title : 'Agenda',
                            message : 'N'+unescape('%e3')+'o '+unescape('%e9')+' permitido cadastrar eventos anteriores a data/hora atual.',
                            btnYes : 'OK'
                        });
                        return false;
                    }

                    if (selectedEndDate < selectedStartDate) {
                        DialogService.messageDialog({
                            title : 'Agenda',
                            message : 'Hora inv'+unescape('%e1')+'lida para o evento.',
                            btnYes : 'OK'
                        });
                        return false;
                    }
                    return true;
                }

                // #############################################################################################################
                // Drag and Drop Adam Shaw Full Calendar Component
                // #############################################################################################################
                $('.external-event').each(function () {

                    var id = $(this).attr('id');
                    id = id.replace('tagEvent', '');

                    var eventObject = {
                        eventType : id
                    };

                    $(this).data('eventObject', eventObject);

                    $(this).draggable({
                        zIndex : 999,
                        revert : true,
                        revertDuration : 0
                    });
                });
            });
}(jQuery, angular, window.alert, window.confirm, window.unescape));