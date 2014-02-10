ddescribe('Controller: products-to-buy-confirm-list-spec', function() {

    var productsToBuyConfirmCtrl = null;

    var item1 = null;
    var item2 = null;
    var item3 = null;
    var item4 = null;

    // load the controller's module
    beforeEach(module('tnt.catalog.productsToBuy.confirm.ctrl'));

    beforeEach(function() {
        item1 = {
            id : 1,
            qty : 0
        };
        item2 = {
            id : 2,
            qty : 4
        };
        item3 = {
            id : 3,
            qty : 0
        };
        item4 = {
            id : 3,
            qty : 2
        };
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.stockReport = {
            sessions : {}
        };

        productsToBuyConfirmCtrl = $controller('ProductsToBuyConfirmCtrl', {
            $scope : scope
        });
    }));

    /**
     * <pre>
     * Given a stockreport 
     * and all products have a property qty 
     * When list is triggered 
     * Then return the products with qty greater then 0
     * </pre>
     */
    it('should list confirmed products', function() {
        // given
        var stockReport = {
            sessions : {
                mySession1 : {
                    lines : {
                        myLine1 : {
                            items : [
                                item1, item2, item3, item4
                            ]
                        }
                    }
                }
            }
        };

        // when
        var result = productsToBuyConfirmCtrl.listConfirmedProducts(stockReport);

        // then
        expect(result.sessions.mySession1).not.toBeUndefined();
        expect(result.sessions.mySession1.lines.myLine1).not.toBeUndefined();
        expect(result.sessions.mySession1.lines.myLine1.items[0]).toEqual(item2);
        expect(result.sessions.mySession1.lines.myLine1.items[1]).toEqual(item4);
    });

    it('should remove a line without products', function() {
        // given
        var stockReport = {
            sessions : {
                mySession1 : {
                    lines : {
                        myLine1 : {
                            items : [
                                item1, item3
                            ]
                        },
                        myLine2 : {
                            items : [
                                item2, item4
                            ]
                        }
                    }
                }
            }
        };

        // when
        var result = productsToBuyConfirmCtrl.listConfirmedProducts(stockReport);

        // then
        expect(result.sessions.mySession1.lines.myLine1).toBeUndefined();
        expect(result.sessions.mySession1.lines.myLine2).not.toBeUndefined();
    });

    it('should remove a sessions without products', function() {
        // given
        var stockReport = {
            sessions : {
                mySession1 : {
                    lines : {
                        myLine1 : {
                            items : [
                                item1, item3
                            ]
                        },
                        myLine2 : {
                            items : [
                                item1, item3
                            ]
                        }
                    }
                },
                mySession2 : {
                    lines : {
                        myLine1 : {
                            items : [
                                item2, item4
                            ]
                        }
                    }
                }
            }
        };

        // when
        var result = productsToBuyConfirmCtrl.listConfirmedProducts(stockReport);

        // then
        expect(result.sessions.mySession1).toBeUndefined();
        expect(result.sessions.mySession2).not.toBeUndefined();
    });
});