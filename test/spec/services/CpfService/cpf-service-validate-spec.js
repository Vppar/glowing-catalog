'use strict';

describe('Service: CpfService', function() {

    // load the service's module
    beforeEach(module('tnt.utils.cpf'));

    // instantiate service
    var CpfService = undefined;
    beforeEach(inject(function(_CpfService_) {
        CpfService = _CpfService_;
    }));

    it('should validate the CPF', function() {
        //Given
        //we save the CPF without any mask
        var cpf = '47855456821';
        
        //when
        var result = CpfService.validate(cpf);
        
        //expect
        expect(result).toBe(true);
        
    });
    
    it('shouldn\'t validate the CPF', function() {
        //Given
        var cpf = '11111111111';
        
        //when
        var result = CpfService.validate(cpf);
        
        //expect
        expect(result).toBe(false);
        
    });
    
    it('shouldn\'t validate the CPF', function() {
        //Given
        var cpf = '74628406893';
        
        //when
        var result = CpfService.validate(cpf);
        
        //expect
        expect(result).toBe(false);
        
    });
    
    it('shouldn\'t validate the CPF, less characters', function() {
        //Given
        var cpf = '1234567';
        
        //when
        var result = CpfService.validate(cpf);
        
        //expect
        expect(result).toBe(false);
        
    });
});
