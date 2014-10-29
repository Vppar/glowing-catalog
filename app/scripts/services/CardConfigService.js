(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.card.config.service', [
            'tnt.catalog.card.config.entity', 'tnt.catalog.card.config.keeper'
        ])
        .service(
            'CardConfigService',
            function CardConfigService ($log, $q, CardConfigKeeper, CardConfig) {

                this.isValid = function (entity) {
                    var invalidProperty = {};

                    var result = [];

                    for ( var ix in invalidProperty) {
                        if (!invalidProperty[ix]) {
                            result.push(ix);
                        }
                    }
                    return result;
                };

                /**
                 * Returns the full entity list.
                 * @return Array - entity list.
                 */
                this.list = function () {
                        var result = null;
                        try {
                            result = CardConfigKeeper.list();
                        } catch (err) {
                            $log
                                .debug('CardConfigKeeper.list: Unable to recover the list of card configs. Err=' +
                                    err);
                        }
                        return result;
                    };

                /**
                 * Returns one entity by uuid.
                 * @return Object - entity.
                 */
                this.loadByUUID = function (uuid) {
                    if (uuid) {
                        var cardConfigList = this.list();
                        if (cardConfigList) {
                            for ( var idx in cardConfigList) {
                                var app = cardConfigList[idx];
                                if (app.uuid === uuid) {
                                    return app;
                                }
                            }
                        }
                    }
                    return {};
                };

                /**
                 * Returns a single card config by its id.
                 * @param uuid - CardConfig uuid.
                 * @return CardConfig - The desired entity.
                 */
                this.read = function (uuid) {
                    var result = null;
                    try {
                        result = CardConfigKeeper.read(uuid);
                    } catch (err) {
                        $log.debug('CardConfigService.read: Unable to find a card config with id=\'' +uuid + '. Err=' + err);
                    }
                    return result;
                };

                /**
                 * Create a card config in the datastore.
                 * @param cardConfig - CardConfig object to be registered.
                 * @return Array - Array of objects containing the invalid
                 *         properties.
                 * @throws Exception in case of a fatal error comming from the
                 *             keeper.
                 */
                this.create = function (cardConfig) {
                    var result = null;
                    cardConfig = new CardConfig(cardConfig);
                    var hasErrors = this.isValid(cardConfig);
                    if (hasErrors.length === 0) {
                        result = CardConfigKeeper.create(cardConfig);
                    } else {
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };

                /**
                 * Update values from card config
                 * @param cardConfigObj - CardConfig to be update.
                 * @return Array - Array of objects containing the invalid
                 *         properties.
                 * @throws Exception in case of a fatal error coming from the
                 *             keeper.
                 */
                this.update = function (cardConfig) {
                    var result = null;
                    var hasErrors = this.isValid(cardConfig);
                    if (hasErrors.length === 0) {
                        result = CardConfigKeeper.update(cardConfig);
                    } else {
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };

            });

})(angular);