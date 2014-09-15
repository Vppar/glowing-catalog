(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.service', ['tnt.catalog.sync.driver', 'tnt.catalog.consultant.service']).service(
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
                var localStorageHash = localStorage.getItem('user') + ':goalPoster:';
                var localData = {
                    consultant: {info: {}, avatar: {}},
                    goals: {
                        1: {},
                        2: {},
                        3: {},
                        4: {}
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
                    angular.extend(data.consultant.avatar, CONSULTANT_IMG_SIZE);
                };

                var updateGoals = function (hash, data) {
                    var goalHash = hash + 'goals:';
                    var imageHash = hash + 'images:';
                    for (var idx in localData.goals) {
                        var storedGoal = localStorage.getItem(goalHash + idx);
                        if (storedGoal) {
                            var goal = JSON.parse(storedGoal);
                            data.goals[idx].name = goal.name;
                            data.goals[idx].deadline = goal.deadline;
                        }
                        data.goals[idx].base64Img = localStorage.getItem(imageHash + idx);
                        angular.extend(data.goals[idx], GOAL_IMG_SIZE[idx]);
                    }
                };

                var updateAlerts = function (hash, data) {
                    var storedAlerts = localStorage.getItem(hash + 'alerts');
                    if (storedAlerts) {
                        data.alerts = JSON.parse(storedAlerts);
                    }
                };

                var updateMessage = function (hash, data) {
                    var storedMessage = localStorage.getItem(hash + 'message');
                    if (storedMessage) {
                        data.messageOfDay = JSON.parse(storedMessage);
                    }
                };

                var updateLocalStorage = function (hash, remoteData) {
                    if (remoteData.lastSync) {
                        localStorage.setItem(hash + 'lastSync', remoteData.lastSync);
                    }

                    if (remoteData.avatar) {
                        localStorage.setItem(hash + 'avatar', remoteData.avatar);
                    }

                    if (remoteData.goals) {
                        for (var idg in remoteData.goals) {
                            localStorage.setItem(hash + 'goals:' + idg, JSON.stringify(remoteData.goals[idg]));
                        }
                    }

                    if (remoteData.images) {
                        for (var idi in remoteData.images) {
                            localStorage.setItem(hash + 'images:' + idi, remoteData.images[idi]);
                        }
                    }
                    if (remoteData.alerts) {
                        localStorage.setItem(hash + 'alerts', JSON.stringify(remoteData.alerts));
                    }
                };

                var updateLocalStorageMessageOfDay = function (hash, messageOfDay) {
                    localStorage.setItem(hash + 'message', JSON.stringify(messageOfDay));
                };

                // #####################################################################################################
                // Published functions
                // #####################################################################################################

                this.isConnected = SyncDriver.isConnected;

                this.checkForUpdates = function () {

                    var result = null;

                    if (SyncDriver.isConnected()) {
                        var now = new Date();
                        var year = now.getFullYear();
                        var month = now.getMonth() + 1;
                        var day = now.getDate();

                        var lastSyncPromise = remote.lastSync().then(
                            // on success
                            function (lastSyncRemote) {
                                var lastSyncLocal = localStorage.getItem(localStorageHash + 'lastSync');
                                if (lastSyncRemote && lastSyncRemote > lastSyncLocal) {
                                    remote.getData().then(function (remoteData) {
                                        updateLocalStorage(localStorageHash, remoteData);
                                    });
                                }
                            });
                        var messageOfDayPromise = remote.getMessageOfDay(year, month, day).then(function (messageOfDay) {
                            if (messageOfDay) {
                                updateLocalStorageMessageOfDay(localStorageHash, messageOfDay);
                            }
                        });
                        result = [lastSyncPromise, messageOfDayPromise];
                    } else {
                        var deferred = $q.defer();
                        deferred.resolve('Disconnected from firebase');
                        result = [deferred.promise];
                    }

                    return $q.all();
                };

                this.updateLocalData = function () {
                    updateConsultant(localStorageHash, localData);
                    updateGoals(localStorageHash, localData);
                    updateAlerts(localStorageHash, localData);
                    updateMessage(localStorageHash, localData);
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
                    localStorage.setItem(localStorageHash + 'avatar', base64Image);
                    localStorage.setItem(localStorageHash + 'lastSync', now);
                    remote.setAvatarImage(base64Image, now);
                };

                this.setGoal = function (idx, goal) {
                    var now = new Date().getTime();
                    localStorage.setItem(localStorageHash + 'goals:' + idx, JSON.stringify(goal));
                    localStorage.setItem(localStorageHash + 'lastSync', now);
                    remote.setGoal(idx, goal, now);
                };

                this.setGoalImage = function (idx, base64Image) {
                    var now = new Date().getTime();
                    localStorage.setItem(localStorageHash + 'images:' + idx, base64Image);
                    localStorage.setItem(localStorageHash + 'lastSync', now);
                    remote.setGoalImage(idx, base64Image, now);
                };
            }]);
})(angular);
