describe('Controller: ReceivableListCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.list.ctrl');
        module('tnt.catalog.entity.service');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.filters.uuidCode');
    });

    var scope = {};
    var log = {};
    var ReceivableServiceMock = {};
    var now = new Date();
    var EntityServiceMock = {};
    var OrderService = [];
    var BookService = [];
    var Book = [];
    var ReceivableListCtrl = null;

    log.debug = angular.noop;

    function daysToMilliseconds(days) {
        return days * 24 * 60 * 60 * 1000;
    }


    var entities = [{
        uuid : 1,
        name : 'Albert Einstein'
    }, {
        uuid : 2,
        name : 'Chris Hemsworth'
    }];
    var orderReuturn = [{uuid:"cc02b600-5d0b-11e3-96c3-010001000022"}];

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $filter, _ArrayUtils_) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivables = {};
        scope.dtFilter = {
                dtInitial : new Date(),
                dtFinal : new Date()
            };

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        ReceivableServiceMock.listActive = jasmine.createSpy('ReceivableService.listActive').andReturn([]);
        ReceivableServiceMock.listActiveByDocument = jasmine.createSpy('ReceivableService.listActiveByDocument').andReturn([]);
        ReceivableServiceMock.listByDocument = jasmine.createSpy('ReceivableService.listByDocument').andReturn([]);
        ReceivableServiceMock.list = jasmine.createSpy('ReceivableService.list');
        scope.selectReceivableMode = jasmine.createSpy('scope.selectReceivableMode');
        OrderService.read = jasmine.createSpy('OrderService.read').andReturn(orderReuturn);
        
        // EntityService mock
        EntityServiceMock.list = jasmine.createSpy('EntityService.list').andReturn(entities);
        EntityServiceMock.read = jasmine.createSpy('EntityService.read').andReturn({name:'blabla'});
        ReceivableListCtrl = $controller('ReceivableListCtrl', {
            $scope : scope,
            $filter : $filter,
            ReceivableService : ReceivableServiceMock,
            $log : log,
            ArrayUtils : _ArrayUtils_,
            EntityService : EntityServiceMock,
            OrderService : OrderService,
            BookService : BookService,
            Book : Book
        });
    }));


    describe('ReceivableListCtrl.receivableDateFilter', function () {
        var receivable = {};

        beforeEach(function () {
            scope.dtFilter.dtInitial = new Date();
            scope.dtFilter.dtFinal = new Date();
        });

        it('is a function', function () {
            expect(ReceivableListCtrl.filterReceivablesByDate).toBeDefined();
            expect(typeof ReceivableListCtrl.filterReceivablesByDate).toBe('function');
        });

        it('returns true if receivable duedate is equal initial datetime', function () {
            // set dtFinal to be greater than the initial date
            scope.selectedReceivableMode = 'listOpen';
            scope.dtFilter.dtFinal.setHours(scope.dtFilter.dtFinal.getHours() + 1);
            receivable.duedate = scope.dtFilter.dtInitial.getTime();
            expect(ReceivableListCtrl.filterByDate(receivable)).toBe(true);
        });

        it('returns true if receivable duedate is equal final datetime', function () {
            // set dtInitial to be lower than the final date
            scope.selectedReceivableMode = 'listOpen';
            scope.dtFilter.dtInitial.setHours(scope.dtFilter.dtInitial.getHours() - 1);
            receivable.duedate = scope.dtFilter.dtFinal.getTime();
            expect(ReceivableListCtrl.filterByDate(receivable)).toBe(true);
        });

        it('returns true if receivable duedate is greater than initial datetime and lower than final datetime', function () {
            var now = new Date();
            scope.selectedReceivableMode = 'listOpen';
            // set dtInitial to be in the past
            scope.dtFilter.dtInitial.setHours(scope.dtFilter.dtInitial.getHours() - 1);

            // set dtInitial to be in the future
            scope.dtFilter.dtFinal.setHours(scope.dtFilter.dtFinal.getHours() + 1);

            // set receivable's duedate to be now
            receivable.duedate = now.getTime();
            expect(ReceivableListCtrl.filterByDate(receivable)).toBe(true);
        });

        it('returns false if receivable duedate is lower than initial datetime', function () {
            var now = new Date();
            // Set duedate to a date in the past, before date initial
            now.setHours(now.getHours() - 46);
            receivable.duedate = now.getTime();
            expect(ReceivableListCtrl.filterByDate(receivable)).toBe(false);
        });

        //FIX ME fix test.
        xit('returns false if receivable duedate is greater than final datetime', function () {
            var now = new Date();
            // Set duedate to a date in the future, after final date
            now.setHours(now.getHours() + 1);
            receivable.duedate = now.getTime();
            expect(ReceivableListCtrl.filterByDate(receivable)).toBe(false);
        });
    });

    //XXX Removed queryFilter from controller
    xdescribe('ReceivableListCtrl.receivableQueryFilter', function () {
        var receivable;

        beforeEach(function () {
            receivable = {};
        });


        it('filters by amount', function () {
            scope.query = '123';
            scope.$apply();

            // Exact matches
            receivable.amount = 123;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.amount = 12345;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.amount = 678;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by remarks', function () {
            scope.query = 'A reasonable remark.';
            scope.$apply();

            // Exact matches
            receivable.remarks = scope.query;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.remarks = 'This is not a reasonable remark.';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.remarks = 'A different remark.';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by type', function () {
            scope.query = 'cash';
            scope.$apply();

            // Exact matches
            receivable.type = scope.query;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.type = 'check';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by id', function () {
            scope.query = 'foobar';
            scope.$apply();

            // Exact matches
            receivable.uuid = scope.query;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.uuid = 'foobarbaz';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.uuid = 'baz';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by entityName', function () {
            scope.query = 'Albert';
            scope.$apply();

            // Exact matches
            receivable.entityName = scope.query;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.entityName = 'Albert Einstein';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.entityName = 'Chris Hemsworth';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('is case insensitive', function () {
            scope.query = 'CASH';
            scope.$apply();
            receivable.type = 'cash';
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);
        });

        it('matches multiple fields', function () {
            scope.query = 'cash 123';
            scope.$apply();
            receivable.type = 'cash';
            receivable.amount = 123;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Matches cash but not amount
            receivable.amount = 567;
            expect(ReceivableListCtrl.receivableQueryFilter(receivable)).toBe(false);
        });
    });


    describe('filtering', function () {
        beforeEach(function () {
            scope.dtFilter.dtInitial = new Date();
            scope.dtFilter.dtFinal = new Date();
            scope.disable = {
                discount : false,
                extra : false
            };
        });

        describe('initial date', function () {

            xit('is always the earliest', function () {
                var final = scope.dtFilter.dtFinal;

                // Set the final date to a date before the initial
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() - 90);
                scope.$apply();

                expect(scope.dtFilter.dtInitial).toBe(final);
            });

            it('is set to current date on initialization', function () {
                scope.$apply();
                expect(scope.dtFilter.dtInitial.getDate()).toBe(now.getDate());
                expect(scope.dtFilter.dtInitial.getMonth()).toBe(now.getMonth());
                expect(scope.dtFilter.dtInitial.getFullYear()).toBe(now.getFullYear());
            });

            xit('sets its time to 0:00:00.000 on initialization', function () {
                scope.$apply();
                expect(scope.dtFilter.dtInitial.getHours()).toBe(0);
                expect(scope.dtFilter.dtInitial.getMinutes()).toBe(0);
                expect(scope.dtFilter.dtInitial.getSeconds()).toBe(0);
                expect(scope.dtFilter.dtInitial.getMilliseconds()).toBe(0);
            });

            xit('sets its time to 0:00:00.000 when initial date changes', function () {
                var newDate = new Date();
                newDate.setDate(newDate.getDate() + 1);

                scope.dtFilter.dtInitial = newDate;
                scope.$apply();

                expect(scope.dtFilter.dtInitial.getHours()).toBe(0);
                expect(scope.dtFilter.dtInitial.getMinutes()).toBe(0);
                expect(scope.dtFilter.dtInitial.getSeconds()).toBe(0);
                expect(scope.dtFilter.dtInitial.getMilliseconds()).toBe(0);
            });
        });


        describe('final date', function () {
            it('is always the latest', function () {
                var initial = scope.dtFilter.dtInitial;

                // Set the initial date to a date after the final
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() + 90);
                scope.$apply();

                expect(scope.dtFilter.dtFinal).toBe(initial);
            });

            it('is set to current date on initialization', function () {
                scope.$apply();
                expect(scope.dtFilter.dtFinal.getDate()).toBe(now.getDate());
                expect(scope.dtFilter.dtFinal.getMonth()).toBe(now.getMonth());
                expect(scope.dtFilter.dtFinal.getFullYear()).toBe(now.getFullYear());
            });

            xit('its time is set to 0:00:00.000 on initialization', function () {
                scope.$apply();
                expect(scope.dtFilter.dtFinal.getHours()).toBe(23);
                expect(scope.dtFilter.dtFinal.getMinutes()).toBe(59);
                expect(scope.dtFilter.dtFinal.getSeconds()).toBe(59);
                expect(scope.dtFilter.dtFinal.getMilliseconds()).toBe(999);
            });

            xit('has its time set to 0:00:00.000 when initial date changes', function () {
                var newDate = new Date();
                // Set final date to a different date
                newDate.setDate(newDate.getDate() + 1);

                scope.dtFilter.dtFinal = newDate;
                scope.$apply();

                expect(scope.dtFilter.dtFinal.getHours()).toBe(23);
                expect(scope.dtFilter.dtFinal.getMinutes()).toBe(59);
                expect(scope.dtFilter.dtFinal.getSeconds()).toBe(59);
                expect(scope.dtFilter.dtFinal.getMilliseconds()).toBe(999);
            });
        });

        //XXX There no more filter by query on controller.
        xdescribe('query', function () {
            it('is empty on initialization', function () {
                scope.$apply();
                expect(scope.query).toBe('');
            });
        });

        describe('receivables list', function () {
            var receivables = null;

            beforeEach(function () {
                receivables = [];

                // An old and expired receivable
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
                    documentId : "cc02b600-5d0b-11e3-96c3-010001000019",
                    // created one month ago
                    created : new Date().getTime() - daysToMilliseconds(28),
                    entityId : 1,
                    type : "check",
                    amount : 123,
                    // expired one week ago
                    duedate : new Date().getTime() - daysToMilliseconds(7)                    
                });
                
                
                // An old receivable that has not expired yet
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000020",
                    documentId : "cc02b600-5d0b-11e3-96c3-010001000019",
                    created : new Date().getTime() - daysToMilliseconds(7),
                    entityId : 2,
                    type : "check",
                    amount : 124,
                    duedate : new Date().getTime() + daysToMilliseconds(7)
                });

                // A newly created receivable already expired
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000021",
                    documentId : "cc02b600-5d0b-11e3-96c3-010001000019",
                    created : new Date().getTime(),
                    entityId : 1,
                    type : "cash",
                    amount : 125,
                    duedate : new Date().getTime()
                });

                // A newly created receivable expiring in the future
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000022",
                    documentId : "cc02b600-5d0b-11e3-96c3-010001000019",
                    created : new Date().getTime(),
                    entityId : 2,
                    type : "check",
                    amount : 126,
                    duedate : new Date().getTime() + daysToMilliseconds(15)
                });

                ReceivableServiceMock.listActive.andReturn(receivables);
            }); // beforeEach


            xit('is updated when initial date changes', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();
                // Show only receivables with due dates in the next 30 days
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() + 30);
                scope.$apply();
                log.debug('Filtered Receivables', scope.receivables.list);
                expect(scope.receivables.list.length).toBe(3);
            });

            //FIX ME fix test.
            xit('is updated when final date changes', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();
                // Show only receivables with due dates in the last 30 days
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() - 30);
                scope.$apply();
                expect(scope.receivables.list.length).toBe(2);
            });


            //XXX removed query filter from controller.
            xit('is updated when query changes', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();
                scope.query = '123';
                // Set initial date to a date far away in the past
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() - 60);
                // Set final date to a date far away in the future
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() + 60);
                scope.$apply();
                
                expect(scope.receivables.list.length).toBe(1);
            });


            //FIX ME fix test.
            xit('expands when query filter is loosened up', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();
                scope.query = '123';

                // Set initial date to a date far away in the past
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() - 60);
                // Set final date to a date far away in the future
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() + 60);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(1);

                scope.query = '';
                scope.$apply();
                
                expect(scope.receivables.list.length).toBe(receivables.length);
                
            });

           //FIX ME fix test.
           xit('expands when date filter is loosened up', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();

                // Show only receivables with due dates in the last 30 days
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() - 30);
                scope.dtFilter.dtFinal.setMilliseconds(scope.dtFilter.dtFinal.getMilliseconds() - 1);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(2);

                scope.dtFilter.dtFinal = new Date();
                // Show receivables from the last 30 days AND until 1 week in the future
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() + 7);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(3);
            });

            xit('gets the entityName attribute set for each receivable', function () {
                scope.dtFilter.dtInitial = new Date();
                scope.dtFilter.dtFinal = new Date();

                // Set a wide date range to get all receivables
                scope.dtFilter.dtInitial.setDate(scope.dtFilter.dtInitial.getDate() - 90);
                scope.dtFilter.dtFinal.setDate(scope.dtFilter.dtFinal.getDate() + 90);
                scope.$apply();r

                expect(scope.receivables.list.length).toBe(4);
                for (var idx in scope.receivables.list) {
                    expect(scope.receivables.list[idx].entityName).toBeDefined();
                }
            });
        }); // receivables list
    }); // filtering

});
