describe('Controller: ReceivableSearchCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.search.ctrl');
        module('tnt.catalog.entity.service');
        module('tnt.catalog.filter.sum');
    });

    var receivableId = 1;
    var scope = {};
    var log = {};
    var ReceivableServiceMock = {};
    var now = new Date();
    var EntityServiceMock = {};

    var ReceivableSearchCtrl;

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


    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $filter, _ArrayUtils_) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivables = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        ReceivableServiceMock.list = jasmine.createSpy('ReceivableService.list').andReturn([]);


        // EntityService mock
        EntityServiceMock.list = jasmine.createSpy('EntityService.list').andReturn(entities);

        ReceivableSearchCtrl = $controller('ReceivableSearchCtrl', {
            $scope : scope,
            $filter : $filter,
            ReceivableService : ReceivableServiceMock,
            $log : log,
            ArrayUtils : _ArrayUtils_,
            EntityService : EntityServiceMock
        });
    }));


    describe('ReceivableSearchCtrl.receivableDateFilter', function () {
        var receivable = {};

        beforeEach(function () {
            scope.dtInitial = new Date();
            scope.dtFinal = new Date();
        });

        it('is a function', function () {
            expect(ReceivableSearchCtrl.receivableDateFilter).toBeDefined();
            expect(typeof ReceivableSearchCtrl.receivableDateFilter).toBe('function');
        });

        it('returns true if receivable duedate is equal initial datetime', function () {
            // set dtFinal to be greater than the initial date
            scope.dtFinal.setHours(scope.dtFinal.getHours() + 1);
            receivable.duedate = scope.dtInitial.getTime();
            expect(ReceivableSearchCtrl.receivableDateFilter(receivable)).toBe(true);
        });

        it('returns true if receivable duedate is equal final datetime', function () {
            // set dtInitial to be lower than the final date
            scope.dtInitial.setHours(scope.dtInitial.getHours() - 1);
            receivable.duedate = scope.dtFinal.getTime();
            expect(ReceivableSearchCtrl.receivableDateFilter(receivable)).toBe(true);
        });

        it('returns true if receivable duedate is greater than initial datetime and lower than final datetime', function () {
            var now = new Date();

            // set dtInitial to be in the past
            scope.dtInitial.setHours(scope.dtInitial.getHours() - 1);

            // set dtInitial to be in the future
            scope.dtFinal.setHours(scope.dtFinal.getHours() + 1);

            // set receivable's duedate to be now
            receivable.duedate = now.getTime();
            expect(ReceivableSearchCtrl.receivableDateFilter(receivable)).toBe(true);
        });

        it('returns false if receivable duedate is lower than initial datetime', function () {
            var now = new Date();
            // Set duedate to a date in the past, before date initial
            now.setHours(now.getHours() - 1);
            receivable.duedate = now.getTime();
            expect(ReceivableSearchCtrl.receivableDateFilter(receivable)).toBe(false);
        });

        it('returns false if receivable duedate is greater than final datetime', function () {
            var now = new Date();
            // Set duedate to a date in the future, after final date
            now.setHours(now.getHours() + 1);
            receivable.duedate = now.getTime();
            expect(ReceivableSearchCtrl.receivableDateFilter(receivable)).toBe(false);
        });
    });


    describe('ReceivableSearchCtrl.receivableQueryFilter', function () {
        var receivable;

        beforeEach(function () {
            receivable = {};
        });


        it('filters by amount', function () {
            scope.query = '123';
            scope.$apply();

            // Exact matches
            receivable.amount = 123;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.amount = 12345;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.amount = 678;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by remarks', function () {
            scope.query = 'A reasonable remark.';
            scope.$apply();

            // Exact matches
            receivable.remarks = scope.query;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.remarks = 'This is not a reasonable remark.';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.remarks = 'A different remark.';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by type', function () {
            scope.query = 'cash';
            scope.$apply();

            // Exact matches
            receivable.type = scope.query;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.type = 'check';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by id', function () {
            scope.query = 'foobar';
            scope.$apply();

            // Exact matches
            receivable.uuid = scope.query;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.uuid = 'foobarbaz';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.uuid = 'baz';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('filters by entityName', function () {
            scope.query = 'Albert';
            scope.$apply();

            // Exact matches
            receivable.entityName = scope.query;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Partial matches
            receivable.entityName = 'Albert Einstein';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // No match
            receivable.entityName = 'Chris Hemsworth';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });

        it('is case insensitive', function () {
            scope.query = 'CASH';
            scope.$apply();
            receivable.type = 'cash';
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);
        });

        it('matches multiple fields', function () {
            scope.query = 'cash 123';
            scope.$apply();
            receivable.type = 'cash';
            receivable.amount = 123;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(true);

            // Matches cash but not amount
            receivable.amount = 567;
            expect(ReceivableSearchCtrl.receivableQueryFilter(receivable)).toBe(false);
        });
    });


    describe('filtering', function () {
        beforeEach(function () {
            scope.dtInitial = new Date();
            scope.dtFinal = new Date();
        });

        describe('initial date', function () {

            it('is always the earliest', function () {
                var final = scope.dtFinal;

                // Set the final date to a date before the initial
                scope.dtFinal.setDate(scope.dtFinal.getDate() - 90);
                scope.$apply();

                expect(scope.dtInitial).toBe(final);
            });

            it('is set to current date on initialization', function () {
                scope.$apply();
                expect(scope.dtInitial.getDate()).toBe(now.getDate());
                expect(scope.dtInitial.getMonth()).toBe(now.getMonth());
                expect(scope.dtInitial.getFullYear()).toBe(now.getFullYear());
            });

            it('sets its time to 0:00:00.000 on initialization', function () {
                scope.$apply();
                expect(scope.dtInitial.getHours()).toBe(0);
                expect(scope.dtInitial.getMinutes()).toBe(0);
                expect(scope.dtInitial.getSeconds()).toBe(0);
                expect(scope.dtInitial.getMilliseconds()).toBe(0);
            });

            it('sets its time to 0:00:00.000 when initial date changes', function () {
                var newDate = new Date();
                newDate.setDate(newDate.getDate() + 1);

                scope.dtInitial = newDate;
                scope.$apply();

                expect(scope.dtInitial.getHours()).toBe(0);
                expect(scope.dtInitial.getMinutes()).toBe(0);
                expect(scope.dtInitial.getSeconds()).toBe(0);
                expect(scope.dtInitial.getMilliseconds()).toBe(0);
            });
        });


        describe('final date', function () {
            it('is always the latest', function () {
                var initial = scope.dtInitial;

                // Set the initial date to a date after the final
                scope.dtInitial.setDate(scope.dtInitial.getDate() + 90);
                scope.$apply();

                expect(scope.dtFinal).toBe(initial);
            });

            it('is set to current date on initialization', function () {
                scope.$apply();
                expect(scope.dtFinal.getDate()).toBe(now.getDate());
                expect(scope.dtFinal.getMonth()).toBe(now.getMonth());
                expect(scope.dtFinal.getFullYear()).toBe(now.getFullYear());
            });

            it('its time is set to 0:00:00.000 on initialization', function () {
                scope.$apply();
                expect(scope.dtFinal.getHours()).toBe(23);
                expect(scope.dtFinal.getMinutes()).toBe(59);
                expect(scope.dtFinal.getSeconds()).toBe(59);
                expect(scope.dtFinal.getMilliseconds()).toBe(999);
            });

            it('has its time set to 0:00:00.000 when initial date changes', function () {
                var newDate = new Date();
                // Set final date to a different date
                newDate.setDate(newDate.getDate() + 1);

                scope.dtFinal = newDate;
                scope.$apply();

                expect(scope.dtFinal.getHours()).toBe(23);
                expect(scope.dtFinal.getMinutes()).toBe(59);
                expect(scope.dtFinal.getSeconds()).toBe(59);
                expect(scope.dtFinal.getMilliseconds()).toBe(999);
            });
        });


        describe('query', function () {
            it('is empty on initialization', function () {
                scope.$apply();
                expect(scope.query).toBe('');
            });
        });

        describe('receivables list', function () {
            var receivables;

            beforeEach(function () {
                receivables = [];

                // An old and expired receivable
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
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
                    created : new Date().getTime() - daysToMilliseconds(7),
                    entityId : 2,
                    type : "check",
                    amount : 124,
                    duedate : new Date().getTime() + daysToMilliseconds(7)
                });

                // A newly created receivable already expired
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000021",
                    created : new Date().getTime(),
                    entityId : 1,
                    type : "cash",
                    amount : 125,
                    duedate : new Date().getTime()
                });

                // A newly created receivable expiring in the future
                receivables.push({
                    uuid : "cc02b600-5d0b-11e3-96c3-010001000022",
                    created : new Date().getTime(),
                    entityId : 2,
                    type : "check",
                    amount : 126,
                    duedate : new Date().getTime() + daysToMilliseconds(15)
                });

                ReceivableServiceMock.list.andReturn(receivables);
            }); // beforeEach


            it('is updated when initial date changes', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();
                // Show only receivables with due dates in the next 30 days
                scope.dtFinal.setDate(scope.dtFinal.getDate() + 30);
                scope.$apply();
                log.debug('Filtered Receivables', scope.receivables.list);
                expect(scope.receivables.list.length).toBe(3);
            });

            it('is updated when final date changes', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();
                // Show only receivables with due dates in the last 30 days
                scope.dtInitial.setDate(scope.dtInitial.getDate() - 30);
                scope.$apply();
                expect(scope.receivables.list.length).toBe(2);
            });



            it('is updated when query changes', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();

                // Set initial date to a date far away in the past
                scope.dtInitial.setDate(scope.dtInitial.getDate() - 60);
                // Set final date to a date far away in the future
                scope.dtFinal.setDate(scope.dtFinal.getDate() + 60);
                scope.$apply();

                scope.query = '123';
                scope.$apply();
                expect(scope.receivables.list.length).toBe(1);
            });



            it('expands when query filter is loosened up', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();

                // Set initial date to a date far away in the past
                scope.dtInitial.setDate(scope.dtInitial.getDate() - 60);
                // Set final date to a date far away in the future
                scope.dtFinal.setDate(scope.dtFinal.getDate() + 60);
                scope.$apply();

                scope.query = '123';
                scope.$apply();
                expect(scope.receivables.list.length).toBe(1);

                scope.query = '';
                scope.$apply();
                expect(scope.receivables.list.length).toBe(receivables.length);
            });


            it('expands when date filter is loosened up', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();

                // Show only receivables with due dates in the last 30 days
                scope.dtInitial.setDate(scope.dtInitial.getDate() - 30);
                scope.dtFinal.setMilliseconds(scope.dtFinal.getMilliseconds() - 1);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(2);

                scope.dtFinal = new Date();
                // Show receivables from the last 30 days AND until 1 week in the future
                scope.dtFinal.setDate(scope.dtFinal.getDate() + 7);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(3);
            });

            it('gets the entityName attribute set for each receivable', function () {
                scope.dtInitial = new Date();
                scope.dtFinal = new Date();

                // Set a wide date range to get all receivables
                scope.dtInitial.setDate(scope.dtInitial.getDate() - 90);
                scope.dtFinal.setDate(scope.dtFinal.getDate() + 90);
                scope.$apply();

                expect(scope.receivables.list.length).toBe(4);
                for (var idx in scope.receivables.list) {
                    expect(scope.receivables.list[idx].entityName).toBeDefined();
                }
            });
        }); // receivables list
    }); // filtering

});
