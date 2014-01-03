(function(angular, window) {
    'use strict';

    angular.module('tnt.catalog.gopay.integration', ['tnt.catalog.service.data']).service('GoPayService', function GoPayService($log, $q, DataProvider) {

        if (!angular.isDefined(window.webintent)) {
            $log.warn('WebIntent is not loaded!');

            this.pay = function() {
                var message = 'WebIntent is not loaded!';

                $log.warn(message);

                var deferred = $q.defer();
                deferred.reject(message);

                return deferred.promise;
            };

            this.listen = function() {
                $log.debug('WebIntent is not loaded!');
            };

            return;
        } else {
            var webintent = window.webintent;
        }

        this.pay = function(amount, description) {
            var deferred = $q.defer();

            webintent.startActivity({
                action : webintent.ACTION_MAIN,
                handler : {
                    packageName : 'com.gopay.vpsa',
                    className : 'com.gopay.vpsa.Payment'
                },
                extras : {
                    'idMerchant' : DataProvider.gopay.merchant,
                    'token' : DataProvider.gopay.token,
                    'descricao' : description,
                    'valor' : amount
                }
            }, function(data) {
                $log.info('Fired new payment intent for ' + amount + ' and merchant ' + DataProvider.gopay.merchant);
                deferred.resolve();
            }, function(message) {
                $log.error('Failed to fire new payment intent for ' + amount + ' and merchant ' + DataProvider.gopay.merchant);
                $log.debug(message);
                deferred.reject();
            });

            return deferred.promise;
        };

        var getExtra = function(name) {

            var deferred = $q.defer();

            webintent.getExtra(name, function(data) {
                deferred.resolve(data);
            }, function(error) {
                $log.error("Failed to get property " + name + " from bundle");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        this.listen = function(amount, description) {
            webintent.onNewIntent(function intentCallback() {

                var data = {
                    id : getExtra("ID"),
                    times : getExtra("Times"),
                    flag : getExtra("Flag"),
                    amount : getExtra("Value"),
                    digits : getExtra("LastFourDigits"),
                    type : getExtra("Type")
                };

                // re registering the listener
                webintent.onNewIntent(intentCallback);

                var promise = $q.all([
                    data.id, data.times, data.flag, data.amount, data.digits, data.type
                ]);

                promise.then(function() {
                    $log.info("New payment received and all is good");
                }, function() {
                    $log.error("New payment received but there is information missing");
                });

                // FIXME Call some service to register the payment, on success or failure
            });
        };
    });

    angular.module('tnt.catalog.gopay', ['tnt.catalog.gopay.integration']).run(function(GoPayService) {
        GoPayService.listen();
    });

})(angular, window);