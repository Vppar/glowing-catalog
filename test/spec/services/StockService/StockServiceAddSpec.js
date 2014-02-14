ddescribe('Service: StockServiceAddSpec -', function() {

    var log = null;
    var fakeNow = null;
    var StockKeeper = null;
    var InventoryKeeper = null;
    var $q = null;

    // mock and stub
    beforeEach(function() {
        fakeNow = 1386444467895;
        StockKeeper = {};
        InventoryKeeper = {};

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock.service');
        module('tnt.catalog.stock.entity');
        module('tnt.utils.array');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('StockKeeper', StockKeeper);
            $provide.value('InventoryKeeper', InventoryKeeper);
        });
    });

    beforeEach(inject(function(_Stock_, _StockService_, _$q_, _$rootScope_) {
        Stock = _Stock_;
        StockService = _StockService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    describe('When add is triggered', function() {

        it('should add a product to the stock', function() {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add').andCallFake(function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
                return deferred.promise;
            });
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([]);

            var wannaBeStockEntry = {
                id : 5,
                quantity : 5,
                cost : 66.6
            };
            var result = null;
            // when
            runs(function() {
                StockService.add(wannaBeStockEntry).then(function() {
                    result = true;
                });
            });

            waitsFor(function() {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function() {
                var stockEntry = new Stock(wannaBeStockEntry.id, wannaBeStockEntry.quantity, wannaBeStockEntry.cost);
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).toHaveBeenCalledWith(stockEntry);
            });
        });

        it('shouldn\'t add a invalid product to the stock', function() {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add');
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([
                {
                    stub : 'i\'m a stub'
                }
            ]);

            var wannaBeStockEntry = {
                id : 5,
                quantity : 5,
                cost : 66.6
            };

            var result = null;
            // when
            runs(function() {
                StockService.add(wannaBeStockEntry).then(null, function(_result_) {
                    result = _result_;
                });
            });

            waitsFor(function() {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function() {
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).not.toHaveBeenCalledWith();
            });
        });
        
        it('shouldn\'t add a product rejected by the keeper', function() {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add').andCallFake(function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.reject('rejected');
                }, 0);
                return deferred.promise;
            });
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([]);

            var wannaBeStockEntry = {
                id : 5,
                quantity : 5,
                cost : 66.6
            };

            var result = null;
            // when
            runs(function() {
                StockService.add(wannaBeStockEntry).then(null, function(_result_) {
                    result = _result_;
                });
            });

            waitsFor(function() {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function() {
                var stockEntry = new Stock(wannaBeStockEntry.id, wannaBeStockEntry.quantity, wannaBeStockEntry.cost);
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).toHaveBeenCalledWith(stockEntry);
                expect(result).toBe('rejected');
            });
        });

    });
});
