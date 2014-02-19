'use strict';

describe('Service: GoPayGateway', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.gopay.gateway'));

    // instantiate service
    var GoPayGateway = undefined;
    var $httpBackend = undefined;
    var $rootScope = undefined;
    beforeEach(inject(function(_GoPayGateway_, _$q_, _$rootScope_ ,_$httpBackend_) {
        GoPayGateway = _GoPayGateway_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should get status 0', function() {
        var result = undefined;
        var cc = {};
        var expected = { Status : 0}; 
        
        $httpBackend.when('POST', 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374').respond(expected);
        
        runs(function() {
            GoPayGateway.pay(cc).then(function(message) {
                result = message;
            }, function(message) {
                result = message;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result).toEqual(expected);
        });
    });
    
    it('should get status -1', function() {
        var result = undefined;
        var cc = {};
        var expected = { Status : -1}; 
        
        $httpBackend.when('POST', 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374').respond(expected);
        
        runs(function() {
            GoPayGateway.pay(cc).then(function(message) {
                result = message;
            }, function(message) {
                result = message;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result).toEqual(expected);
        });
    });
    
    it('should get -2', function() {
        var result = undefined;
        var cc = {};
        var expected = { Status : -2}; 
        
        $httpBackend.when('POST', 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374').respond(expected);
        
        runs(function() {
            GoPayGateway.pay(cc).then(function(message) {
                result = message;
            }, function(message) {
                result = message;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result).toEqual(expected);
        });
    });
    
    it('should get status -3', function() {
        var result = undefined;
        var cc = {};
        var expected = { Status : -3}; 
        
        $httpBackend.when('POST', 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374').respond(expected);
        
        runs(function() {
            GoPayGateway.pay(cc).then(function(message) {
                result = message;
            }, function(message) {
                result = message;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result).toEqual(expected);
        });
    });
    
    it('should get return an error', function() {
        var result = undefined;
        var cc = {};
        var expected = 'There was an error contacting the server'; 
        
        $httpBackend.when('POST', 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374').respond(500);
        
        runs(function() {
            GoPayGateway.pay(cc).then(function(message) {
                result = message;
            }, function(message) {
                result = message;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result).toEqual(expected);
        });
    });

});
