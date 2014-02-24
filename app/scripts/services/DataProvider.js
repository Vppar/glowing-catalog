(function(angular) {
    'use strict';

    /**
     * Providing data since... ever.
     */
    angular.module('tnt.catalog.service.data', []).service(
            'DataProvider', function DataProvider($q, $http, $timeout, $rootScope, InventoryKeeper, Replayer, JournalEntry) {

                var scope = this;

                this.gopay = {
                    merchant : false,
                    token : null
                };
                this.reloadGoPay = function() {
                    if (localStorage.gpToken === 'null') {
                        this.gopay.merchant = false;
                        this.gopay.token = null;
                    } else {
                        this.gopay.merchant = true;
                        this.gopay.token = localStorage.gpToken;
                    }
                };
                this.reloadGoPay();

                this.envFlags = {
                    internet : true
                };

                this.cardData = {}; // See app/resources/data.json
                this.date = {}; // See app/resources/data.json

                this.customers = [];
                this.deliveries = [];
                this.entities = [];
                this.expenses = [];
                this.receivables = [];
                this.orders = [];
                this.payments = [];
                this.paymentTypes = [
                    {
                        id : 1,
                        description : 'cash'
                    }
                ];
                this.phoneTypes = [];
                this.representative = {
                    name : 'Valtanette de Paula'
                };
                this.states = [];
                this.products = [];
                this.lines = [];

                $http.get('resources/data.json').then(function(response) {

                    angular.extend(scope, response.data);

                    if (scope.products.length) {
                        $rootScope.$broadcast('DataProvider.update');
                    }

                });

                $http.get('resources/products.json').then(function(response) {
                    angular.extend(scope.products, response.data);

                    InventoryKeeper.build(scope.products);

                    if (scope.lines.length) {
                        $rootScope.$broadcast('DataProvider.update');
                    }
                });

                // FIXME remove these fake entries ASAP
                this.fakeJournal = function() {
                    var deferred = $q.defer();
                    $.get('resources/replay.json', function(result) {
                        for ( var ix in result) {
                            var data = result[ix];
                            var item = new JournalEntry(0, 0, data.type, data.version, data.event);
                            Replayer.replay(item);
                        }
                        $rootScope.$broadcast('DataProvider.replayFinished');
                        deferred.resolve();
                    });

                    return deferred.promise;
                };
            });
}(angular));
