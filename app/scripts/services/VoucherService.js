(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.service', [
        'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper', 'tnt.catalog.entity.service', 'tnt.utils.array'
    ]).service('VoucherService', ['$q', '$log', 'Voucher', 'VoucherKeeper', 'EntityService', 'ArrayUtils', function VoucherService($q, $log, Voucher, VoucherKeeper, EntityService, ArrayUtils) {

        var isValid = function isValid(voucher) {
            var invalidProperty = {};
            // FIXME - Verify if is a valid entityId
            invalidProperty.entityId = true;
            // FIXME - Verify if is a valid voucher type
            invalidProperty.type = angular.isDefined(voucher.type);
            invalidProperty.amount = Number(voucher.amount) > 0;

            var result = [];

            for ( var ix in invalidProperty) {
                if (!invalidProperty[ix]) {
                    // Create a new empty object, set a property
                    // with the name of the invalid property,
                    // fill it with the invalid value and add to
                    // the result
                    var error = {};
                    error[ix] = voucher[ix];
                    result.push(error);
                }
            }

            return result;
        };


        var create = function create(voucher) {
            var result = null;
            var hasErrors = isValid(voucher);
            if (hasErrors.length === 0) {
                if (!(voucher instanceof Voucher)) {
                    voucher = new Voucher(
                        null,
                        voucher.entity,
                        voucher.type,
                        voucher.amount
                    );
                }

                result = VoucherKeeper.create(voucher);
                result['catch'](function(err) {
                    $log.error('VoucherService.create: -Failed to create a voucher. ', err);
                });
            } else {
                $log.error('VoucherService.create: -Invalid voucher. ', hasErrors);
                result = $q.reject(hasErrors);
            }
            return result;
        };


        var redeem = function redeem(type, id, document) {
            if (!type || !id) {
                $log.warn('No voucher/id passed to VoucherService.redeem()');
            }

            var vouchers = list(type);
            var voucher = ArrayUtils.find(vouchers, 'id', id);

            if (!voucher) {
                throw 'VoucherService.redeem: voucher does not exist!';
            }

            if (voucher.redeemed) {
                throw 'VoucherService.redeem: voucher already redeemed!';
            }

            if (voucher.canceled) {
                throw 'VoucherService.canceled: voucher already canceled!';
            }

            return VoucherKeeper.redeem(type, id, document);
        };


        var cancel = function cancel(type, id) {
            if (!type || !id) {
                $log.warn('No voucher/id passed to VoucherService.cancel()');
            }

            var vouchers = list(type);
            var voucher = ArrayUtils.find(vouchers, 'id', id);

            if (!voucher) {
                throw 'VoucherService.redeem: voucher does not exist!';
            }

            if (voucher.redeemed) {
                throw 'VoucherService.redeem: voucher already redeemed!';
            }

            if (voucher.canceled) {
                throw 'VoucherService.canceled: voucher already canceled!';
            }

            return VoucherKeeper.cancel(type, id);
        };

        var list = function list(type) {
            if (!type) {
                throw 'VoucherService.list: invalid type';
            }

            return VoucherKeeper.list(type);
        };


        var listByDocument = function listByDocument(document) {
            if (!document) {
                throw 'VoucherService.listByDocument: missing document';
            }

            return VoucherKeeper.listByDocument(document);
        };


        var getVoucher = function (type, id) {
            var voucherId = angular.isObject(type) ? type.id : id;
            var vouchers = list(type);
            return ArrayUtils.find(vouchers, 'id', voucherId);
        };



        var bulkCreate = function bulkCreate(vouchers) {
            var creationPromises = [];

            // Vouchers can be either vouchers or giftCards
            for (var idx in vouchers) {
                creationPromises.push(create(vouchers[idx]));
            }

            return $q.all(creationPromises);
        };


        var bulkProcess = function bulkProcess(vouchers, entity, document) {
            var voucherPromises = [];

            for (var ix in vouchers) {
                var usedVoucher = vouchers[ix];
                if (usedVoucher.amount > 0) {
                    var existingVoucher = getVoucher(usedVoucher.type, usedVoucher.couponId);

                    if (!existingVoucher) {
                        throw 'VoucherService.bulkRegister: Voucher not found!';
                    }

                    if (existingVoucher.redeemed) {
                        // FIXME: voucher was already redeemed! What should I do!?
                        throw 'VoucherService.bulkRegister: Voucher already used!';
                    }

                    if (usedVoucher.amount > existingVoucher.amount) {
                        throw 'VoucherService.bulkRegister: Invalid amount!';
                    }

                        voucherPromises.push(redeem(existingVoucher.type, existingVoucher.id, document));
                     
                        if (usedVoucher.amount < existingVoucher.amount) {

                        // Customer did not use the whole voucher. Create a new one with
                        // difference.
                        var change = Math.round((existingVoucher.amount - usedVoucher.amount) * 100) / 100;

                        var changeVoucher = new Voucher({
                            id : null,
                            amount : change,
                            entity : usedVoucher.entity,
                            type : usedVoucher.type
                        });

                        voucherPromises.push(create(changeVoucher));
                    }
                } else {
                    $log.warn('Voucher will be ignored because its amount is 0: ' + JSON.stringify(usedVoucher));
                }
            }

            return $q.all(voucherPromises);
        };


        this.isValid = isValid;
        this.create = create;
        this.bulkCreate = bulkCreate;
        this.bulkProcess = bulkProcess;
        this.cancel = cancel;
        this.create = create;
        this.redeem = redeem;
        this.list = list;
        this.listByDocument = listByDocument;

    }]);
})(angular);
