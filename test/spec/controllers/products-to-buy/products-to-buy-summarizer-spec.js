describe('Controller: products-to-buy-summarizer-spec', function() {

    var PurchaseOrderService = {};
    var UserService = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.productsToBuy.ctrl');
    });

    var item1 = {
        hide : true,
        id : 1,
        session : "session1",
        line : "Olhos",
        minQty : 2,
        points : 18,
        price : 23
    };
    var item2 = {
        hide : false,
        id : 2,
        session : "session1",
        line : "Olhos",
        minQty : 5,
        points : 21,
        price : 32
    };
    var item3 = {
        hide : true,
        id : 3,
        session : "session2",
        line : "Suvaco",
        minQty : 2,
        points : 9,
        price : 98
    };
    var item4 = {
        hide : false,
        id : 4,
        session : "session2",
        line : "Suvaco",
        minQty : 1,
        points : 2,
        price : 3
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {

        scope = $rootScope.$new();

        UserService.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn');

        productsToBuy = $controller('ProductsToBuyCtrl', {
            $scope : scope,
            PurchaseOrderService : PurchaseOrderService,
            UserService : UserService
        });
    }));

    it('should summarize without the hide', function() {
        // given
        scope.purchaseOrder = {
            items : {
                1 : item1,
                2 : item2,
                3 : item3,
                4 : item4
            }
        };

        var qtyWatch = {
            1 : '2',
            2 : '3',
            3 : '4',
            4 : '0'
        };

        var expected = {
            amount : 534,
            amount2 : 0,
            sessions : {
                session1 : {
                    total : 142,
                    minQty : 7,
                    orderQty : '023',
                    avg : 6.173913043478261,
                    pts : 99,
                    lines : {
                        Olhos : {
                            total : 142,
                            minQty : 7,
                            orderQty : '023',
                            avg : 6.173913043478261,
                            pts : 99
                        }
                    }
                },
                session2 : {
                    total : 392,
                    minQty : 3,
                    orderQty : '04',
                    avg : 98,
                    pts : 36,
                    lines : {
                        Suvaco : {
                            total : 392,
                            minQty : 3,
                            orderQty : '04',
                            avg : 98,
                            pts : 36
                        }
                    }
                }
            },
            amountWithDiscount : 0,
            points : 135
        };

        // when
        scope.summarizer(qtyWatch, false);

        // then
        expect(scope.summary.total).toEqual(expected);
    });

    it('should summarize with the hide', function() {
        // given
        scope.purchaseOrder = {
            items : {
                1 : item1,
                2 : item2,
                3 : item3,
                4 : item4
            }
        };

        var qtyWatch = {
            1 : '2',
            2 : '3',
            3 : '4',
            4 : '0'
        };

        var expected = {
            amount : 534,
            amount2 : 0,
            sessions : {
                session1 : {
                    total : 96,
                    minQty : 5,
                    orderQty : '03',
                    avg : 32,
                    pts : 63,
                    lines : {
                        Olhos : {
                            total : 96,
                            minQty : 5,
                            orderQty : '03',
                            avg : 32,
                            pts : 63
                        }
                    }
                },
                session2 : {
                    total : 0,
                    minQty : 1,
                    orderQty : 0,
                    avg : 0,
                    pts : 0,
                    lines : {
                        Suvaco : {
                            total : 0,
                            minQty : 1,
                            orderQty : 0,
                            avg : 0,
                            pts : 0
                        }
                    }
                }
            },
            amountWithDiscount : 0,
            points : 135
        };

        // when
        scope.summarizer(qtyWatch, true);

        // then
        expect(scope.summary.total).toEqual(expected);
    });

});