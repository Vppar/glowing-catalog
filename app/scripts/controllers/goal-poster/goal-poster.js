(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.ctrl', [
        'tnt.catalog.user',
        'tnt.utils.fileinput',
        'tnt.catalog.goalposter.service'
    ]).controller(
        'GoalPosterCtrl',
        [
            '$scope',
            'UserService',
            'DialogService',
            'GoalPosterService',
            function ($scope, UserService, DialogService, GoalPosterService) {

                UserService.redirectIfInvalidUser();
                GoalPosterService.updateLocalData();

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                var offlineWarning = function () {
                    DialogService.messageDialog({
                        title: 'Cartaz de metas',
                        message: 'Não é possível editar o cartaz de metas em modo offline.',
                        btnYes: 'Fechar'
                    });
                };

                var editImage = function (data, success) {
                    DialogService.openImageUploadDialog(data).then(
                        function (base64Img) {
                            if (base64Img) {
                                success(base64Img);
                            }
                        }
                    );
                };

                // #####################################################################################################
                // Scope variables
                // #####################################################################################################

                $scope.consultant = GoalPosterService.getConsultant();
                $scope.goals = GoalPosterService.getGoals();
                $scope.alerts = GoalPosterService.getAlerts();
                $scope.messageOfDay = GoalPosterService.getMessageOfDay();

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################
                $scope.editGoal = function (idx) {
                    if (GoalPosterService.isConnected()) {
                        var goal = $scope.goals[idx];
                        DialogService.openGoalPosterEditDialog(goal).then(
                            function (goal) {
                                if (goal) {
                                    $scope.goals[idx].name = goal.name;
                                    $scope.goals[idx].deadline = goal.deadline;

                                    GoalPosterService.setGoal(idx, goal);
                                }
                            }
                        );
                    } else {
                        offlineWarning();
                    }
                };

                $scope.goalImageUpload = function (idx) {
                    if (GoalPosterService.isConnected()) {
                        var data = $scope.goals[idx];
                        var success = function (base64Img) {
                            $scope.goals[idx].base64Img = base64Img;
                            GoalPosterService.setGoalImage(idx, base64Img);
                        };
                        editImage(data, success);
                    } else {
                        offlineWarning();
                    }
                };

                $scope.avatarImageUpload = function () {
                    if (GoalPosterService.isConnected()) {
                        var data = $scope.consultant.avatar;
                        var success = function (base64Img) {
                            $scope.consultant.avatar.base64Img = base64Img;
                            GoalPosterService.setAvatarImage(base64Img);
                        };
                        editImage(data, success);
                    } else {
                        offlineWarning();
                    }
                };
            }
        ]);
})
(angular);
