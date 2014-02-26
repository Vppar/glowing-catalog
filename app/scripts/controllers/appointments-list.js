(function(angular) {
    'use strict';

    angular.module('tnt.vpsa.appointments.events', ['tnt.vpsa.appointments.service.event']).controller(
            'EventsController',
            function($scope, $q,EventService) {
            	
            	$scope.events = [
                                 {
  								   "id":1,
  								   "dataCriacao":"12-12-2014 00:00:00",
  								   "dataAlteracao":"12-12-2014 00:00:00",
  								   "dataEvento":"12-12-2014",
  								   "horaInicio":"12:35:20",
  								   "horaFim":"14:35:20",
  								   "endereco":
  								     {
								         "rua":"R. Shishima Hifumi",
								         "numero":1940,
								         "bairro":"Urbanova",
								         "cidade":"São josé dos campos",
								         "estado":"SP"
								      },
  								   "descricao":"Visita na casa do valtanete",
  								   "contatos":[
  				                                {
  												   "id":1,
  												   "dataCriacao":"12-12-2014 00:00:00",
  												   "dataAlteracao":"12-12-2014 00:00:00",
  												   "nome":"Valtanet",
  												   "favorito":false,
  												   "enderecos":[
  												      {
  												         "rua":"R. Shishima Hifumi",
  												         "numero":1940,
  												         "bairro":"Urbanova",
  												         "cidade":"São josé dos campos",
  												         "estado":"SP"
  												      }
  												   ],
  												   "emails":[
  												      {
  												         "email":"valtanet@vpsa.com.br"
  												      }
  												   ],
  												   "telefones":[
  												      {
  												         "ddd":"012",
  												         "numero":"39430000"
  												      }
  												   ],
  												   "usuario":{
  												      "id":1,
  												      "nome":"VALTANETE",
  												      "origem":"WHISHLIST"
  												   }
  												},
  											    {
  													   "id":2,
  													   "dataCriacao":"12-12-2014 00:00:00",
  													   "dataAlteracao":"12-12-2014 00:00:00",
  													   "nome":"Phillip",
  													   "favorito":false,
  													   "enderecos":[
  													      {
  													         "rua":"R. 9 de Julho",
  													         "numero":1000,
  													         "bairro":"Centro",
  													         "cidade":"São josé dos campos",
  													         "estado":"SP"
  													      }
  													   ],
  													   "emails":[
  													      {
  													         "email":"philip@tripex.com.br"
  													      }
  													   ],
  													   "telefones":[
  													      {
  													         "ddd":"012",
  													         "numero":"39230000"
  													      }
  													   ],
  													   "usuario":{
  													      "id":1,
  													      "nome":"PHILIP",
  													      "origem":"WHISHLIST"
  													   }
  													}
  				                            ],
  								   "tipoEvento":"VISITA",
  								   "statusEvento":"PENDENTE"
                                 }
  								 ];
                
             	/**
            	 * @param since datainicial
            	 * @param upon datafinal do periodo
            	 */
            	
                $scope.listEventsByPeriod = function () {
                	alert('listEventsByPeriod ' + $scope.since + ' - ' + $scope.upon);
//                    $scope.events = EventService.listEventsByPeriod(since,upon);
                };

             	/**
            	 * @param event JSON do Evento
            	 */
                $scope.create = function (event) {
                	alert('create ' + event);
//                  EventService.createEvent(event);
                };
                
             	/**
            	 * @param event JSON do Evento alterado
            	 */
                $scope.update = function (event) {
                	alert('update ' + event);
//                EventService.updateEvent(event);
                };
             	/**
            	 * @param eventId id do Evento
            	 */
                $scope.done = function (eventId) {
                	alert('done ' + eventId);
//                  $scope.events = EventService.done(event);
                };
             	/**
            	 * @param eventId id do Evento
            	 */
                $scope.cancel = function (eventId) {
                	alert('cancel ' + eventId);
//                  $scope.events = EventService.cancel(event);
                };
              
                /**
            	 * 
            	 * @param since datainicial
            	 * @param upon datafinal do periodo
            	 * 
            	 * 
            	 */
                $scope.listBirthdaysByPeriod = function () {
                  ContactService.listBirthdaysByPeriod($scope.since,$scope.upon);
                };
                
             });
}(angular));

