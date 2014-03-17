'use strict';

describe('Service: BookServiceWriteSpec', function() {

    var BookService = {};
    var BookKeeper = {};

    var $rootScope = null;
    var $q = null;
    var logger = angular.noop;

    var $log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };
    
    beforeEach(function () {
        spyOn($log, 'debug').andCallThrough();
        spyOn($log, 'error').andCallThrough();
        spyOn($log, 'warn').andCallThrough();
        spyOn($log, 'fatal').andCallThrough();
    });
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.book');

        module(function($provide) {
            $provide.value('BookKeeper', BookKeeper);
            $provide.value('$log', $log);
        });
    });

    beforeEach(inject(function(_BookService_, _$rootScope_, _$q_) {
        BookService = _BookService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    it('should inject BookService properly', function() {
        expect(!!BookService).toBe(true);
    });

    it('should write a book entry', function() {
        // Given
        var result = null;
        var returnedMsg = 'resolved promise';
        var entry = {
            stub : 'I\'m a stub',
        };

        BookKeeper.write = jasmine.createSpy('BookKeeper.write').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve(returnedMsg);
            }, 0);
            return deferred.promise;
        });

        // When
        runs(function() {
            BookService.write(entry).then(function(_result_) {
                result = _result_;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return !!result;
        });

        // Then
        runs(function() {
            expect(BookKeeper.write).toHaveBeenCalledWith(entry);
            expect(result).toBe(returnedMsg);
        });
    });

    it('shouldn\'t write a book entry', function() {
        // Given
        var result = null;
        var returnedMsg = 'rejected promise';
        var entry = {
            stub : 'I\'m a stub',
        };

        BookKeeper.write = jasmine.createSpy('BookKeeper.write').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.reject(returnedMsg);
            }, 0);
            return deferred.promise;
        });

        // When
        runs(function() {
            BookService.write(entry).then(null, function(_result_) {
                result = _result_;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return !!result;
        });

        // Then
        runs(function() {
            expect(result).toBe(returnedMsg);
        });
    });

});
