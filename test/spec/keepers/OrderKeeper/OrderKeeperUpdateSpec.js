'use strict';

describe(
    'Service: OrderKeeperUpdateSpec',
    function () {

        var JournalEntry = null;
        var fakeNow = null;
        var jKeeper = {};
        var OrderKeeper = null;
        var Order = null;

        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var code = 12;
        var date = new Date().getTime();
        var customerId = 1;
        var items = [];
        var IdentityService = {};

        var order = {
            uuid : uuid,
            code : code,
            date : date,
            customerId : customerId,
            items : items
        };

        // load the service's module
        beforeEach(function () {
            module('tnt.catalog.order.keeper');
            module('tnt.catalog.order.entity');
            module('tnt.catalog.journal');
            module('tnt.catalog.journal.entity');
            module('tnt.catalog.journal.replayer');

            fakeNow = 1386179100000;
            spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

            jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
            IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(uuid);
            IdentityService.getUUIDData =
                jasmine.createSpy('IdentityService.getUUIDData').andReturn({
                    deviceId : 1
                });
            IdentityService.getDeviceId =
                jasmine.createSpy('IdentityService.getDeviceId').andReturn(1);

            module(function ($provide) {
                $provide.value('JournalKeeper', jKeeper);
                $provide.value('IdentityService', IdentityService);
            });
        });

        // instantiate service
        beforeEach(inject(function (_Order_, _OrderKeeper_, _JournalEntry_) {
            Order = _Order_;
            OrderKeeper = _OrderKeeper_;
            JournalEntry = _JournalEntry_;
        }));

        it('should update an order', function () {

            var addEv = new Order(order);
            var recEv = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                updated : fakeNow,
                items : [
                    {
                        test : 'updated'
                    }
                ]
            };
            
            recEv = new Order(recEv);

            var receiveEntry = new JournalEntry(null, recEv.updated, 'orderUpdate', 1, recEv);

            OrderKeeper.handlers['orderAddV1'](addEv);

            var items = [
                {
                    test : 'updated'
                }
            ];

            // when
            var receiveCall = function () {
                OrderKeeper.update(addEv.uuid, items);
            };

            expect(receiveCall).not.toThrow();
            expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
        });

        it('shouldn\'t update an order', function () {

            var addEv = new Order(order);

            OrderKeeper.handlers['orderAddV1'](addEv);

            // when
            var receiveCall = function () {
                OrderKeeper.update('cc02b600-5d0b-11e3-96c3-010001000002', null);
            };
            expect(receiveCall).toThrow(
                'Unable to find an order with uuid=\'cc02b600-5d0b-11e3-96c3-010001000002\'');
            expect(jKeeper.compose).not.toHaveBeenCalled();
        });

    });
