(function (angular) {
    'use strict'

    angular.module('tnt.catalog.goalposter.service', []).service('GoalPosterService', ['$q', 'SyncDriver', 'ConsultantService', function ($q, SyncDriver, ConsultantService) {

        var remote = SyncDriver.goalPoster;
        var images = [];
        var alerts = [];
        var messagesOfDay = {};
        var user = localStorage.getItem('user');
        var goalImageSizes = [{
            areaType: 'square',
            size: 50
        }, {
            areaType: 'circle',
            size: 220
        }, {
            areaType: 'circle',
            size: 250
        }, {
            areaType: 'circle',
            size: 250
        }, {
            areaType: 'circle',
            size: 220
        }]

        var updateLocalData = function () {
            images[0] = localStorage.getItem(user + ':goalPoster:image:0');
            images[1] = localStorage.getItem(user + ':goalPoster:image:1');
            images[2] = localStorage.getItem(user + ':goalPoster:image:2');
            images[3] = localStorage.getItem(user + ':goalPoster:image:3');
            images[4] = localStorage.getItem(user + ':goalPoster:image:4');

            alerts = JSON.parse(localStorage.getItem(user + ':goalPoster:alerts'));
            messagesOfDay = JSON.parse(localStorage.getItem(user + ':goalPoster:messages'));
        };

        var updateLocalStorage = function () {
            remote.getData().then(function (goalPosterData) {
                localStorage.setItem(user + ':goalPoster:lastSync', goalPosterData.lastSyncRemote);
                localStorage.setItem(user + ':goalPoster:image:0', goalPosterData.images['0']);
                localStorage.setItem(user + ':goalPoster:image:1', goalPosterData.images['1']);
                localStorage.setItem(user + ':goalPoster:image:2', goalPosterData.images['2']);
                localStorage.setItem(user + ':goalPoster:image:3', goalPosterData.images['3']);
                localStorage.setItem(user + ':goalPoster:image:4', goalPosterData.images['4']);

                localStorage.setItem(user + ':goalPoster:alerts', JSON.stringify(goalPosterData.alerts));
                localStorage.setItem(user + ':goalPoster:messages', JSON.stringify(goalPosterData.messages));

                updateLocalData();
            });
        };

        this.setImage = function (id, base64Image) {
            var now = new Date().getTime();
            localStorage.setItem(user + ':goalPoster:image:' + id, base64Image);
            localStorage.setItem(user + ':goalPoster:lastSync', now);
            remote.setImage(id, base64Image, now);
        };

        this.getConsultant = function () {
            return ConsultantService.get();
        };

        this.getImagesSize = function () {
            return angular.copy(goalImageSizes);
        };

        this.getImages = function () {
            return images;
        };
        this.getAlerts = function () {
            return images;
        };
        this.getMessageOfDay = function () {
            var messageChoice = new Date().getDate() % 4;
            return messagesOfDay[messageChoice];
        };

        this.checkForUpdates = function () {
            remote.lastSync().then(function (lastSyncRemote) {
                var lastSyncLocal = localStorage.getItem(user + ':goalPoster:lastSync');
                if (lastSyncRemote > lastSyncLocal) {
                    updateLocalStorage();
                } else {
                    updateLocalData();
                }
            });
        }
    }]);

})(angular);
