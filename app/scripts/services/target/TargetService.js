(function(angular) {
    'use strict';

    angular.module('tnt.catalog.target.service', []).service(
        'TargetService',
        [
            '$q',
            'logger',
            'ArrayUtils',
            'FinancialMathService',
            'Target',
            'TargetKeeper',
            function TargetService($q, logger, ArrayUtils, FinancialMathService, Target, TargetKeeper) {

                var log = logger.getLogger('tnt.catalog.target.service');

                // ###############################################################################################
                // Public methods
                // ###############################################################################################

                this.isValid =
                    function(target) {
                        var invalidProperty = {};

                        invalidProperty.targets = angular.isDefined(target.targets);
                        invalidProperty.type = angular.isDefined(target.type);
                        invalidProperty.totalAmount = angular.isDefined(target.totalAmount);
                        invalidProperty.name = angular.isDefined(target.name) && angular.isString(target.name);

                        var result = [];

                        for ( var ix in invalidProperty) {
                            if (!invalidProperty[ix]) {
                                // Create a new empty object, set a
                                // property
                                // with the name of the invalid
                                // property,
                                // fill it with the invalid value and
                                // add to
                                // the result
                                var error = {};
                                error[ix] = target[ix];
                                result.push(error);
                            }
                        }

                        return result;
                    };

                this.add = function add(target) {
                    var result = null;

                    var hasErrors = this.isValid(target);

                    if (hasErrors.length === 0) {
                        var targetEntry = new Target(null ,target.targets, target.type, target.totalAmount, target.name);
                        result = TargetKeeper.add(targetEntry);
                    } else {
                        log.error('TargetService.add: -Invalid target. ', hasErrors);
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };

                this.findTarget = function findTarget(targetId) {
                    var copyList = TargetKeeper.list();
                    return ArrayUtils.find(copyList, 'uuid', targetId);
                };

                this.list = function list() {
                    return TargetKeeper.list();
                };

            }
        ]);
})(angular);
