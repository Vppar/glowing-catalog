describe('Service: StockServiceAddSpec -', function () {

    var fakeNow = {};
    var StockKeeper = {};
    var StockService = {};
    var Stock = {};
    var $q = {};
    var $rootScope = {};
    var loggerMock = {};

    // mock and stub
    beforeEach(function () {
        module('tnt.catalog.stock.service');
        module('tnt.catalog.stock.entity');
        module('tnt.utils.array');
    });

    // load the service's module
    beforeEach(module(function ($provide) {
        $provide.value('StockKeeper', StockKeeper);
    }));

    beforeEach(inject(function (_Stock_, _StockService_, _$q_, _$rootScope_) {
        Stock = _Stock_;
        StockService = _StockService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    beforeEach(function () {
        fakeNow = 1386444467895;
        loggerMock.info = jasmine.createSpy('logger.info');
        loggerMock.error = jasmine.createSpy('logger.error');
        loggerMock.getLogger = jasmine.createSpy('logMock.getLogger').andReturn(loggerMock);

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    describe('When add is triggered', function () {

        it('should add a product to the stock', function () {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add').andCallFake(function () {
                var deferred = $q.defer();
                setTimeout(function () {
                    deferred.resolve();
                }, 0);
                return deferred.promise;
            });
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([]);

            var wannaBeStockEntry = {
                inventoryId : 5,
                quantity : 5,
                cost : 66.6
            };
            var result = null;
            // when
            runs(function () {
                StockService.add(wannaBeStockEntry).then(function () {
                    result = true;
                });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function () {
                var stockEntry =
                    new Stock(
                        wannaBeStockEntry.inventoryId,
                        wannaBeStockEntry.quantity,
                        wannaBeStockEntry.cost);
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).toHaveBeenCalledWith(stockEntry);
            });
        });

        it('shouldn\'t add a invalid product to the stock', function () {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add');
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([
                {
                    stub : 'i\'m a stub'
                }
            ]);

            var wannaBeStockEntry = {
                inventoryId : 5,
                quantity : 5,
                cost : 66.6
            };

            var result = null;
            // when
            runs(function () {
                StockService.add(wannaBeStockEntry).then(null, function (_result_) {
                    result = _result_;
                });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function () {
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).not.toHaveBeenCalledWith();
            });
        });

        it('shouldn\'t add a product rejected by the keeper', function () {
            // given
            StockKeeper.add = jasmine.createSpy('StockKeeper.add').andCallFake(function () {
                var deferred = $q.defer();
                setTimeout(function () {
                    deferred.reject('rejected');
                }, 0);
                return deferred.promise;
            });
            StockService.isValid = jasmine.createSpy('StockService.isValid').andReturn([]);

            var wannaBeStockEntry = {
                inventoryId : 5,
                quantity : 5,
                cost : 66.6
            };

            var result = null;
            // when
            runs(function () {
                StockService.add(wannaBeStockEntry).then(null, function (_result_) {
                    result = _result_;
                });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return result;
            });

            // then
            runs(function () {
                var stockEntry =
                    new Stock(
                        wannaBeStockEntry.inventoryId,
                        wannaBeStockEntry.quantity,
                        wannaBeStockEntry.cost);
                expect(StockService.isValid).toHaveBeenCalledWith(wannaBeStockEntry);
                expect(StockKeeper.add).toHaveBeenCalledWith(stockEntry);
                expect(result).toBe('rejected');
            });
        });

    });
});
