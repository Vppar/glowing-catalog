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
                    data.alerts = JSON.parse(localStorage.getItem(hash + 'alerts'));
                };

                var updateMessage = function (hash, data) {
                    data.messageOfDay = localStorage.getItem(hash + 'message');
                };

                var updateLocalStorage = function (remoteData) {
                    var hash = user + ':goalPoster:';

                    localStorage.setItem(hash + 'lastSync', remoteData.lastSyncRemote);

                    localStorage.setItem(hash + 'avatar', remoteData.avatar);

                    if (remoteData.goals) {
                        localStorage.setItem(hash + 'goals:1', remoteData.goals['1']);
                        localStorage.setItem(hash + 'goals:2', remoteData.goals['2']);
                        localStorage.setItem(hash + 'goals:3', remoteData.goals['3']);
                        localStorage.setItem(hash + 'goals:4', remoteData.goals['4']);
                    }

                    if (remoteData.images) {
                        localStorage.setItem(hash + 'images:1', remoteData.images['1']);
                        localStorage.setItem(hash + 'images:2', remoteData.images['2']);
                        localStorage.setItem(hash + 'images:3', remoteData.images['3']);
                        localStorage.setItem(hash + 'images:4', remoteData.images['4']);
                    }

                    localStorage.setItem(hash + 'alerts', JSON.stringify(remoteData.alerts));
                    localStorage.setItem(hash + 'messages', JSON.stringify(remoteData.messages));
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
                    updateMessage(hash, localData);
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
                    return localData.messageOfDay;
                };

                this.setAvatarImage = function (base64Image) {
                    var now = new Date().getTime();
                    localStorage.setItem(user + ':goalPoster:avatar', base64Image);
                    localStorage.setItem(user + ':goalPoster:lastSync', now);
                    remote.setAvatarImage(base64Image, now);
                };

                this.setGoal = function (idx, goal) {
                    var now = new Date().getTime();
                    localStorage.setItem(user + ':goalPoster:goals:' + idx, JSON.stringify(goal));
                    localStorage.setItem(user + ':goalPoster:lastSync', now);
                    remote.setGoal(idx, goal, now);
                };

                this.setGoalImage = function (idx, base64Image) {
                    var now = new Date().getTime();
                    localStorage.setItem(user + ':goalPoster:images:' + idx, base64Image);
                    localStorage.setItem(user + ':goalPoster:lastSync', now);
                    remote.setGoalImage(idx, base64Image, now);
                };
            }]);
})(angular);
