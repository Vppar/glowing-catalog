(function(angular) {
    'use strict';
    
    angular.module(
         'tnt.catalog.card.config.service',
        [
        'tnt.catalog.card.config'
    ]).service(
         'CardConfigService',
        [
        '$q', '$log', 'logger', 'CardConfigKeeper',
        function CardConfigService($q, $log, logger, CardConfigKeeper) {

                this.isValid = function(subscription) {
                    var invalidProperty = {};

                    var result = [];
                 
                    for ( var ix in invalidProperty) {
                        if (!invalidProperty[ix]) {
                            var error = {};
                            error[ix] = subscription[ix];
                            result.push(error);
                        }
                    }

                    return result;
                };

                this.add = function add(cardConfig) {
                    var result = this.isValid(cardConfig);
                
                    if (result.length === 0) {
                        return CardConfigKeeper.add(cardConfig);
                    }
                    else {
                        return $q.reject(result);
                    }
                };

                this.update = function (cardConfig) {
                        var result = this.isValid(cardConfig);
                        if (result.length === 0) {
                            try {
                                return CardConfigKeeper.update(cardConfig);
                            } catch (err) {
                                throw 'CardConfigService.update: Unable to update a cardConfig=' +
                                    JSON.stringify(cardConfig) + '. Err=' + err;
                            }
                        }
                        return result;
                    };

                this.list = function() {
                    var result = null;
                    try {
                        result = CardConfigKeeper.list();
                    } catch (err) {
                        $log.debug('CardConfigService.list: Unable to recover the list of card config. Err=' + err);
                    }
                    return result;
                };
                
            }
    ]);
})(angular);