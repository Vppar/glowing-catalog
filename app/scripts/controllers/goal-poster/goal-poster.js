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
                    var goal = $scope.goal[idx];
                    DialogService.openImageUploadDialog(goal).then(
                        function (goal) {
                            if (goal) {
                                $scope.goal[idx].name = goal.name;
                                $scope.goal[idx].deadline = goal.deadline;
                            }
                        }
                    );
                };

                $scope.goalImageUpload = function (id) {
                    var data = $scope.goals[id];
                    var success = function (base64Img) {
                        $scope.goals[id].base64Img = base64Img
                        GoalPosterService.setGoalImage(id, base64Img);
                    };
                    editImage(data, success);
                };

                $scope.avatarImageUpload = function () {
                    var data = {
                        base64Img: $scope.consultant.avatar.base64Img,
                        size: $scope.consultant.avatar.size
                    };
                    var success = function (base64Img) {
                        $scope.consultant.avatar.base64Img = base64Img;
                        GoalPosterService.setAvatarImage(base64Img);
                    };
                    editImage(data, success);
                };
            }
        ]);
})
(angular);
