var tempDate;
var idCount = 0;
var tempId;
var birthdays;

$(function() {

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
		$("#select-event").val(eventType);
	} else {
		$("#select-event").val(0);
	}
	if(hour) {
		$("#select-hour").val(hour);
	} else {
		$("#select-hour").val(8);
	}
	if(minute) {
		$("#select-minute").val(minute);
	} else {
		$("#select-minute").val(0);
	}
	if(client) {
		$("#select-client").val(client);
	} else {
		$("#select-client").val(0);
	}
	if(title) {
		$("#txt-title").val(title);
	} else {
		$("#txt-title").val("");
	}
	if(desc) {
		$("#txt-description").val(desc);
	} else {
		$("#txt-description").val("");
	}
	
	var title = "Novo evento";
	if(eventEdit) {
		title = 'Alterar evento';
		tempId = eventEdit.id;
		$("#btn-delete-event").removeClass("display-none");
	} else {
		tempId = null;
		$("#btn-delete-event").addClass("display-none");
	}
	$( "#dialog" ).dialog({
		modal: true,
		title: title
	});
}

function saveEvent() { //salva o evento
	if(tempId != null) {
		$('#calendar').fullCalendar('removeEvents', tempId);
	}
	var eventType = $("#select-event").val();
	if(eventType > 0) {
		var eventColor = $('.tag' + eventType).find('.tag-circle').css('background-color');
		var client = $("#select-client").val();
		var hour = $("#select-hour").val();
		var minute = $("#select-minute").val();
		var title = $("#txt-title").val();
		var desc = $("#txt-description").val();
		
		var date = tempDate;
		date.setHours(hour);
		date.setMinutes(minute);
		
		var event = {
			title: title,
			start: date,
			allDay: false,
			color: eventColor,
			description: desc,
			client: client,
			type: eventType,
			id: idCount
		};
		
		idCount++;
		
		$('#calendar').fullCalendar('renderEvent', event, true);
		
		closeDialog();
	}
}

function deleteEvent() { // exclui evento
	$('#calendar').fullCalendar('removeEvents', tempId);
	closeDialog();
}

function closeDialog() { // fecha dialogo
	$("#dialog").dialog( "close" );
}
