(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.service', []).service(
        'GoalPosterService',
        [
            '$q',
            '$filter',
            'SyncDriver',
            'ConsultantService',
            function ($q, $filter, SyncDriver, ConsultantService) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                var CONSULTANT_IMG_SIZE = {
                    areaType: 'square',
                    size: 50
                };
                var GOAL_IMG_SIZE = {
                    1: {
                        areaType: 'circle',
                        size: 220
                    },
                    2: {
                        areaType: 'circle',
                        size: 250
                    },
                    3: {
                        areaType: 'circle',
                        size: 250
                    },
                    4: {
                        areaType: 'circle',
                        size: 220
                    }
                };

                var remote = SyncDriver.goalPoster;
                var user = localStorage.getItem('user');
                var localData = {
                    consultant: {info: {}, avatar: {}},
                    goals: {
                        1: {name: 'Meta 1', deadline: 1420081200000},
                        2: {name: 'Meta 2', deadline: 1420081200000},
                        3: {name: 'Meta 3', deadline: 1420081200000},
                        4: {name: 'Meta 4', deadline: 1420081200000}
                    },
                    alerts: [],
                    messagesOfDay: []
                };

                // #####################################################################################################
                // Local functions
                // #####################################################################################################

                var updateConsultant = function (hash, data) {
                    data.consultant.info = ConsultantService.get();
                    data.consultant.avatar.base64Img = localStorage.getItem(hash + 'avatar');
                    data.consultant.avatar.size = angular.copy(CONSULTANT_IMG_SIZE);
                };
                var updateGoals = function (hash, data) {
                    var goalHash = hash + 'goals:';
                    var imageHash = hash + 'images:';
                    for (var idx in localData.goals) {
                        var goal = JSON.parse(localStorage.getItem(goalHash + idx));
                        if (goal) {
                            data.goals[idx].name = goal.name;
                            data.goals[idx].deadline = goal.deadline;
                        }
                        data.goals[idx].base64Img = localStorage.getItem(imageHash + idx);
                        data.goals[idx].size = angular.copy(GOAL_IMG_SIZE[idx]);
                    }
                };

                var updateAlerts = function (hash, data) {
                    data.alerts = JSON.parse(localStorage.getItem(user + ':goalPoster:alerts'));
                };

                var updateMessages = function (hash, data) {
                    var messagesMap = JSON.parse(localStorage.getItem(user + ':goalPoster:messages'));
                    data.messagesOfDay.length = 0;
                    for (var idx in messagesMap) {
                        data.messagesOfDay.push(messagesMap[idx]);
                    }
                };

                var updateLocalStorage = function (remoteData) {
                    localStorage.setItem(user + ':goalPoster:lastSync', remoteData.lastSyncRemote);

                    localStorage.setItem(user + ':goalPoster:avatar', remoteData.avatar);

                    localStorage.setItem(user + ':goalPoster:goals:1', remoteData.goals['1']);
                    localStorage.setItem(user + ':goalPoster:goals:2', remoteData.goals['2']);
                    localStorage.setItem(user + ':goalPoster:goals:3', remoteData.goals['3']);
                    localStorage.setItem(user + ':goalPoster:goals:4', remoteData.goals['4']);

                    localStorage.setItem(user + ':goalPoster:images:1', remoteData.images['1']);
                    localStorage.setItem(user + ':goalPoster:images:2', remoteData.images['2']);
                    localStorage.setItem(user + ':goalPoster:images:3', remoteData.images['3']);
                    localStorage.setItem(user + ':goalPoster:images:4', remoteData.images['4']);

                    localStorage.setItem(user + ':goalPoster:alerts', JSON.stringify(remoteData.alerts));
                    localStorage.setItem(user + ':goalPoster:messages', JSON.stringify(remoteData.messages));
                };

                // #####################################################################################################
                // Published functions
                // #####################################################################################################

                this.checkForUpdates = function () {
                    remote.lastSync().then(
                        // on success
                        function (lastSyncRemote) {
                            var lastSyncLocal = localStorage.getItem(user + ':goalPoster:lastSync');
                            if (lastSyncRemote && lastSyncRemote > lastSyncLocal) {
                                remote.getData().then(function (remoteData) {
                                    updateLocalStorage(remoteData);
                                });
                            }
                        });
                };

                this.updateLocalData = function () {
                    var hash = user + ':goalPoster:';
                    updateConsultant(hash, localData);
                    updateGoals(hash, localData);
                    updateAlerts(hash, localData);
                    updateMessages(hash, localData);
                };

                this.getConsultant = function () {
                    return localData.consultant;
                };

                this.getGoals = function () {
                    return localData.goals;
                };

                this.getAlerts = function () {
                    return localData.alerts;
                };

                this.getMessageOfDay = function () {
                    var messageChoice = Math.round(Math.random() * localData.messagesOfDay.length);
                    return localData.messagesOfDay[messageChoice];
                };

                this.setAvatarImage = function (base64Image) {
                    var now = new Date().getTime();
                    localStorage.setItem(user + ':goalPoster:avatar', base64Image);
                    localStorage.setItem(user + ':goalPoster:lastSync', now);
                    remote.setAvatarImage(base64Image, now);
                };

                this.setGoalImage = function (id, base64Image) {
                    var now = new Date().getTime();
                    localStorage.setItem(user + ':goalPoster:images:' + id, base64Image);
                    localStorage.setItem(user + ':goalPoster:lastSync', now);
                    remote.setGoalImage(id, base64Image, now);
                };

            }]);

})(angular);
