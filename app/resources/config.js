(function (angular) {
    'use strict';

    /**
     * Providing configs since... ever.
     */
    angular.module('tnt.catalog.config', []).service('CatalogConfig', function CatalogConfig () {
        ObjectUtils.ro(this, 'PAYMENT_TYPE_BILLET', 'PAYMENT_TYPE_BILLET');
        ObjectUtils.ro(this, 'PAYMENT_TYPE_CC', 'PAYMENT_TYPE_CC');
        ObjectUtils.ro(this, 'GLOSS', 'GLOSS');
        ObjectUtils.ro(this, 'BLUSH', 'BLUSH');
        ObjectUtils.ro(this, 'RIMEL', 'RIMEL');
        ObjectUtils.ro(this, 'semesterPlanCheckoutURL', 'https://vpink.vc/assinatura/plano/semestral');
        ObjectUtils.ro(this, 'annualPlanCheckoutURL', 'https://vpink.vc/assinatura/plano/anual');
        ObjectUtils.ro(this, 'firebaseURL', 'voppwishlist.firebaseio.com');
        ObjectUtils.ro(this, 'version', '1.4.x');
        ObjectUtils.ro(this, 'cdnURL', 'https://vpink.vc/wishlist/');
        ObjectUtils.ro(this, 'imageBaseURL', 'images/catalog/products/');
        ObjectUtils.ro(this, 'logglyKey', 'a9d09098-638a-4b39-b601-565043ada0cd/tag/development/');
        ObjectUtils.ro(this, 'logLevel', {
            '.console': 9,
            '.sync': 1,
            'tnt.catalog.journal.replayer.Replayer.console': 2,
            'tnt.storage.websql.WebSQLDriver.console': 2,
            'tnt.catalog.sync.service.SyncService.console' : 2,
            'tnt.catalog.manifest.CacheController.console' : 2,
            'tnt.catalog.journal.keeper.JournalKeeper.console' : 2,
            'remotedebug.sync' : 9
        });
    });
})(angular);
