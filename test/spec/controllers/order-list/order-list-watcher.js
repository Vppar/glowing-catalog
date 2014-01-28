describe('Controller: OrderListCtrlWatcherSpec', function() {

    var scope = {};
    var OrderService = {};
    beforeEach(function() {
        module('tnt.catalog.orderList.ctrl');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
        $controller('OrderListCtrl' , {
            $scope : scope,
            OrderService : OrderService
        });
    }));

    scope.orders = [
        {
            canceled : false,
            code : "mary-0001-13",
            customerId : 14,
            date : 1383066000000,
            id : 1,
            items : [
                {
                    price : "85",
                    qty : 1
                }, {
                    price : "32",
                    qty : 1
                }, {
                    price : "90",
                    qty : 1
                }, {
                    price : "23",
                    qty : 2
                }

            ],
            paymentId : 1,
        }
    ];

    scope.customers = [
        {
            id : 14,
            name : 'Valtanette De Paula'
        }
    ];
    
    scope.dateFilter = {
            dtInitial : '',
            dtFinal : ''
        };
    
//    invalid - 1388541600000 
//    valid - 1364958000000

    it('should update the filteredOrders when given a valid date', function() {
        // given
        scope.dateFilter = {
                dtInitial : new Date(1388541600000),
                dtFinal : ''
            };
        
        scope.filteredOrders = [];
        
        scope.$apply();
        
        var oldLength = scope.filteredOrders.length;
        
        scope.dateFilter = {
                dtInitial : '',
                dtFinal : ''
            };
        scope.$apply();
        expect(oldLength).toBe(0);
        expect(scope.filteredOrders.length>0).toBe(true);
    });
});