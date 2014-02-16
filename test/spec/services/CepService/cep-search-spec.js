'use strict';

describe('Service: CepService', function() {

    // load the service's module
    beforeEach(module('tnt.utils.cep'));

    // instantiate service
    var CepService = undefined;
    var $rootScope = {};
    var $httpBackend = undefined;
    beforeEach(inject(function(_CepService_, _$q_, _$rootScope_, _$httpBackend_) {
        CepService = _CepService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    it('should find the address', function() {
        var result = undefined;
        var expected = {address : 'endereço'}; 
        
        $httpBackend.when('GET', 'http://cep.correiocontrol.com.br/80060140.json').respond(expected);
        
        runs(function() {
            CepService.search('80060140').then(function(address) {
                result = address;
            }, function(error) {
                throw error;
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
    
    it('should get status 500', function() {
        var expected = 500; 
        var result = undefined;
        
        $httpBackend.when('GET', 'http://cep.correiocontrol.com.br/8006.json').respond(expected);
        
        runs(function() {
            CepService.search('8006').then(function(address) {
                result = address;
            }, function(error) {
                result = error;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            $httpBackend.flush();
            return result;
        });

        runs(function() {
            expect(result.status).toBe(expected);
        });
    });

});
