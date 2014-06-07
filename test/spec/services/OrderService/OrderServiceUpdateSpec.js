describe('Service: OrderServiceUpdateOrderQty', function() {
    var fakeNow = 1386444467895;
    var logMock = {};
    var loggerMock = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var scope = {};

  var OrderService;
  var scope = null;
  var result = null;
  var q = null;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        loggerMock.error = jasmine.createSpy('logger.error');
        loggerMock.debug = jasmine.createSpy('logger.debug');
        loggerMock.info = jasmine.createSpy('logger.info');
        loggerMock.getLogger = jasmine.createSpy('logMock.getLogger').andReturn(loggerMock);
                                        
        module(function($provide) {
            $provide.value('logger', loggerMock);
            $provide.value('Order', OrderMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
                        
    });

    beforeEach(inject(function(_OrderService_, $rootScope, _$q_) {
        OrderService = _OrderService_;
        scope = $rootScope;
        q = _$q_;
    }));
    
    it('update order successfully.', function() {
        
        OrderKeeperMock.update = jasmine.createSpy('OrderKeeper.update');
       
        var items = [{test : 'updated'}];
                
        var order = OrderService.update(1, items);
        
        expect(OrderKeeperMock.update).toHaveBeenCalled();
    });
    
    it('update order successfully evaluating promise', function() {
        
        PromiseHelper.config(q, angular.noop);   
        OrderKeeperMock.update = jasmine.createSpy('OrderKeeper.update').andCallFake(PromiseHelper.resolved(true));
               
        var result = undefined;
        runs(function() {
            OrderService.update(1, [{test : 'updated'}]).then(function(_result_) {
                result = _result_;
            }, function(error) {
                throw error;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        runs(function() {
            expect(OrderKeeperMock.update).toHaveBeenCalledWith(1, [{test : 'updated'}]);
        });

    });

    it('updateItemQty successfully evaluating promise', function() {
        PromiseHelper.config(q, angular.noop);
        OrderKeeperMock.updateItemQty = jasmine.createSpy('OrderKeeper.updateItemQty').andCallFake(PromiseHelper.resolved(true));

        runs(function() {

            // when
            OrderService.updateItemQty(1, [
                {
                    test : 'updated'
                }
            ]).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        }, 'JournalKeeper is taking too long');

        runs(function() {
            expect(OrderKeeperMock.updateItemQty).toHaveBeenCalledWith(1, [
                {
                    test : 'updated'
                }
            ]);
        });

    });
    
});