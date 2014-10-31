(function(angular) {
    'use strict';
    
    angular.module(
         'tnt.catalog.card.config.service',
        [
        'tnt.catalog.card.config'
    ]).service(
         'CardConfigService',
        [
        '$q', 'logger', 'CardConfigKeeper',
        function CardConfigService($q, logger, CardConfigKeeper) {

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

                this.update = function(cardConfig) {
                    var result = this.isValid(cardConfig);
                    if (result.length === 0) {
                        //cardConfig = new CardConfig(cardConfig);
                        var promise = CardConfigKeeper.update(cardConfig);

                        return promise.then(function(resp) {
                            return resp;
                        }, function(error) {
                            log.error('CardConfigService.update: Unable to update a card config');
                            log.debug(error);
                            return $q.reject();
                        });
                    } else {
                        return $q.reject(result);
                    }
                };
            
                this.list = function() {
                    var result = null;
                    try {
                        result = CardConfigKeeper.list();
                    } catch (err) {
                        log.debug('CardConfigService.list: Unable to recover the list of card config. Err=' + err);
                    }
                    return result;
                };        
                
            }
    ]);
})(angular);