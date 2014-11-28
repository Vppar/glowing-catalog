describe('Controller: CardConfigCtrl', function() {

    beforeEach(function() {
        module('tnt.catalog.card.config');
        module('tnt.catalog.card.config.service');
        module('tnt.catalog.card.config.ctrl');
    });

    var scope = {};
    var $q = {};
    var $rootScope = {};
    var UserService = {};
    var DialogService = {};
    var DataProvider = {};    
    var CardConfigService = {};
    var CardConfigKeeper = {};
    var CardConfig = {};
    var cardConfigs = {};
    var alertTitle = '';
    var dialog = {};

    beforeEach(function() {
        module(function($provide) {
            $provide.value('UserService', UserService);
            $provide.value('DialogService', DialogService);
            $provide.value('CardConfigService', CardConfigService);
            $provide.value('CardConfigKeeper', CardConfigKeeper);
        });
        UserService.redirectIfInvalidUser = jasmine.createSpy('redirectIfInvalidUser');
        CardConfigService.list = jasmine.createSpy('CardConfigService.list').andReturn(cardConfigs); 
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');
    });

	beforeEach(function () {
		alertTitle = 'Configura' + unescape('%e7') + unescape('%e3') + 'o de Cart'+ unescape('%e3') + 'o';

		cardConfigs = [{
			uuid : 'cc33b122-5d0b-22e3-44c3-020001099999',
			ccDaysToExpire : '22',
			ccOpRate1Installment : '3',
			ccOpRate26Installment : '4.3',
			ccOpRate712Installment : '5.98',
			ccClosingDate : '12/01/2014 00:00',
			ccExpirationDate : '12/01/2014 00:00',
			dcDaysToExpire : '66',
			dcOpRate : '7.1'			
		},{
			uuid : 'aa33b122-5d0b-22e3-44c3-020001000001',
			ccDaysToExpire : '10',
			ccOpRate1Installment : '1',
			ccOpRate26Installment : '2.3',
			ccOpRate712Installment : '3.98',
			ccClosingDate : '12/01/2014 00:00',
			ccExpirationDate : '12/01/2014 00:00',
			dcDaysToExpire : '33',
			dcOpRate : '1.1'			
		}];
	});

    beforeEach(inject(function($controller, _$q_, $rootScope, _CardConfig_, _CardConfigService_) {

        scope = $rootScope.$new();
        $q = _$q_;

        CardConfig = _CardConfig_;
        CardConfigService = _CardConfigService_;

		DataProvider.date = angular.copy(sampleData.date);

        DialogService.messageDialog = jasmine.createSpy();
        dialog.close = jasmine.createSpy();

        $controller('CardConfigCtrl', {
            $scope : scope,
            dialog : dialog,
            CardConfigService : CardConfigService,
            CardConfig : CardConfig,
            UserService : UserService,
            DialogService : DialogService,
            DataProvider : DataProvider
        });
    }));

    it('should have days filled', function() {
        expect(scope.ccClosingDateProvider.days).toEqual(DataProvider.date.days);
        expect(scope.ccExpirationDateProvider.days).toEqual(DataProvider.date.days);
    });

    it('should validate ccDaysToExpire', function() {

    	scope.cardConfig = {};
        scope.cardConfig.ccDaysToExpire = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });

    it('should validate ccOpRate1Installment', function() {

    	scope.cardConfig = {};
        scope.cardConfig.ccOpRate1Installment = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'A Taxa da Operadora para pagamento a vista no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.',
            btnYes : 'OK'
        });
    });

    it('should validate ccOpRate26Installment', function() {

    	scope.cardConfig = {};
        scope.cardConfig.ccOpRate26Installment = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'A Taxa da Operadora para pagamento de 2 a 6 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.',
            btnYes : 'OK'
        });
    });

    it('should validate ccOpRate712Installment', function() {

    	scope.cardConfig = {};
        scope.cardConfig.ccOpRate712Installment = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'A Taxa da Operadora para pagamento de 7 a 12 vezes no Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.',
            btnYes : 'OK'
        });
    });

    it('should validate dcDaysToExpire', function() {

    	scope.cardConfig = {};
        scope.cardConfig.dcDaysToExpire = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });

    it('should validate dcOpRate', function() {

    	scope.cardConfig = {};
        scope.cardConfig.dcOpRate = 'ss';
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'A Taxa da Operadora para pagamento no Cart'+ unescape('%e3') + 'o de D'+ unescape('%e9') +'bito '+ unescape('%e9') +' inv'+unescape('%e1')+'lida.',
            btnYes : 'OK'
        });
    });

    it('should validate ccClosingDate', function() {

    	scope.ccClosingDate = {};
        scope.ccClosingDate.day = '2';
        scope.ccClosingDate.month = undefined;
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Dia de Fechamento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });

    it('should validate ccExpirationDate', function() {

    	scope.ccExpirationDate = {};
        scope.ccExpirationDate.day = '2';
        scope.ccExpirationDate.month = undefined;
 
        scope.validateFields();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Dia de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });

    it('should validate cardConfig', function() {

    	scope.cardConfig = {};
        scope.cardConfig.uuid = '11222-3333-444444-444444';
        scope.cardConfig.ccDaysToExpire = '1';
        scope.cardConfig.ccOpRate1Installment = '1';
        scope.cardConfig.ccOpRate26Installment = '1';
        scope.cardConfig.ccOpRate712Installment = '1';
        scope.cardConfig.ccClosingDate = '12/01/2014 00:00';
        scope.cardConfig.ccExpirationDate = '12/01/2014 00:00';
        scope.cardConfig.dcDaysToExpire = '1';
        scope.cardConfig.dcOpRate = '1';
 
        var result = scope.validateFields();

        expect(result).toEqual(true);
    });

    it('should not add card config', function() {    

        scope.cardConfig = {};
        scope.cardConfig.ccDaysToExpire = 'ss';

        scope.confirm();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });  

    it('should add card config', function() {    

    	PromiseHelper.config($q, angular.noop);
        CardConfigService.add = jasmine.createSpy('CardConfigService.add').andCallFake(PromiseHelper.resolved(true));

        scope.cardConfig = {};
        scope.cardConfig.uuid = null;
        scope.cardConfig.ccDaysToExpire = '1';
        scope.cardConfig.ccOpRate1Installment = '1';
        scope.cardConfig.ccOpRate26Installment = '1';
        scope.cardConfig.ccOpRate712Installment = '1';
        scope.cardConfig.ccClosingDate = '12/01/2014 00:00';
        scope.cardConfig.ccExpirationDate = '12/01/2014 00:00';
        scope.cardConfig.dcDaysToExpire = '1';
        scope.cardConfig.dcOpRate = '1';

        scope.confirm();

        expect(CardConfigService.add).toHaveBeenCalled();
    });  

    it('should not update card config', function() {    

        scope.cardConfig = {};
        scope.cardConfig.uuid = '11222-3333-444444-444444';
        scope.cardConfig.ccDaysToExpire = 'ss';

        scope.confirm();

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : alertTitle,
            message : 'O Prazo de Vencimento do Cart'+ unescape('%e3') + 'o de Cr'+ unescape('%e9') +'dito '+ unescape('%e9') +' inv'+unescape('%e1')+'lido.',
            btnYes : 'OK'
        });
    });  

    it('should add update config', function() {    

    	PromiseHelper.config($q, angular.noop);
        CardConfigService.update = jasmine.createSpy('CardConfigService.update').andCallFake(PromiseHelper.resolved(true));

        scope.cardConfig = {};
        scope.cardConfig.uuid = '11222-3333-444444-444444';
        scope.cardConfig.ccDaysToExpire = '1';
        scope.cardConfig.ccOpRate1Installment = '1';
        scope.cardConfig.ccOpRate26Installment = '1';
        scope.cardConfig.ccOpRate712Installment = '1';
        scope.cardConfig.ccClosingDate = '12/01/2014 00:00';
        scope.cardConfig.ccExpirationDate = '12/01/2014 00:00';
        scope.cardConfig.dcDaysToExpire = '1';
        scope.cardConfig.dcOpRate = '1';

        scope.confirm();

        expect(CardConfigService.update).toHaveBeenCalled();
    });  

});