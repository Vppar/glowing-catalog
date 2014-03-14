'use strict';
describe('Service: PurchaseOrderServiceListPendingSpec', function() {

    var PurchaseOrderService = {};
    var StockService = {};
    var TypeKeeper = {};

    beforeEach(function() {
        TypeKeeper.list = jasmine.createSpy('TypeKeeper.list');
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder');
        module('tnt.catalog.purchaseOrder.service');
        module('tnt.catalog.stock.entity');

        module(function($provide) {
            $provide.value('StockService', StockService);
            $provide.value('TypeKeeper', TypeKeeper);
        });
    });

    beforeEach(inject(function(_PurchaseOrderService_) {
        PurchaseOrderService = _PurchaseOrderService_;
    }));

    it('filter the proper order with pending items', function() {
        // given
        var purchases = [
            {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                created : new Date(),
                canceled : false,
                received : 2,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
                created : new Date(),
                canceled : false,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }, {
                        id : 2,
                        qty : 4

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 1
                    }, {
                        productId : 2,
                        qty : 1
                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
                created : new Date(),
                canceled : false,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }, {
                        id : 2,
                        qty : 4

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 2
                    }, {
                        productId : 2,
                        qty : 4
                    }
                ]
            }
        ];

        PurchaseOrderService.list = jasmine.createSpy('list').andReturn(purchases);

        // when
        var result = PurchaseOrderService.listPendingPurchaseOrders();
        // then
        expect(result.length).toBe(1);
    });

    it('filter the items with received property', function() {
        // given
        var purchases = [
            {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                created : new Date(),
                canceled : false,
                received : 2,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
                created : new Date(),
                canceled : false,
                received : 6,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }, {
                        id : 2,
                        qty : 4

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 1
                    }, {
                        productId : 2,
                        qty : 1
                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
                created : new Date(),
                canceled : false,
                received : 6,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }, {
                        id : 2,
                        qty : 4

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 2
                    }, {
                        productId : 2,
                        qty : 4
                    }
                ]
            }
        ];

        PurchaseOrderService.list = jasmine.createSpy('list').andReturn(purchases);

        // when
        var result = PurchaseOrderService.listPendingPurchaseOrders();
        // then
        expect(result.length).toBe(0);
    });

    it('filter the items that received all products', function() {
        // given
        var purchases = [
            {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                created : new Date(),
                canceled : false,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 2
                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
                created : new Date(),
                canceled : false,
                items : [
                    {
                        id : 1,
                        qty : 5

                    }, {
                        id : 2,
                        qty : 7

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 5
                    }, {
                        productId : 2,
                        qty : 7
                    }
                ]
            }, {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
                created : new Date(),
                canceled : false,
                items : [
                    {
                        id : 1,
                        qty : 2

                    }, {
                        id : 2,
                        qty : 4

                    }
                ],
                itemsReceived : [
                    {
                        productId : 1,
                        qty : 2
                    }, {
                        productId : 2,
                        qty : 4
                    }
                ]
            }
        ];

        PurchaseOrderService.list = jasmine.createSpy('list').andReturn(purchases);

        // when
        var result = PurchaseOrderService.listPendingPurchaseOrders();
        // then
        expect(result.length).toBe(0);
    });
});
