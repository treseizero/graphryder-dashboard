'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('DoiCtrl', function ($scope, $resource, config, $rootScope, $uibModal, $location) {

      $scope.type = "doi";

      /***** Init ******/
      // When rootScope is ready load the graph
      $rootScope.$watch('ready', function(newVal) {
          if(newVal) {
              $scope.layoutChoice = $rootScope.layout[17];
              $scope.drawDoiGraph();
          }
      });

      /***** Graph creation *****/
      if($rootScope.search != undefined) {
          if( $rootScope.search.uid != undefined) {
              $scope.field = "uid";
              $scope.value = $rootScope.search.uid;
          }
          else if( $rootScope.search.pid != undefined) {
              $scope.field = "pid";
              $scope.value = $rootScope.search.pid;
          }
          else if( $rootScope.search.cid != undefined) {
              $scope.field = "cid";
              $scope.value = $rootScope.search.cid;
          }
      }
      else {
          $scope.field = "uid";
          $scope.value = "34";
      }
      $scope.doiSize = 25;
      $scope.graphSigma = [];

      $scope.drawDoiGraph = function () {
          // // Read the complete graph from api
          if($scope.field == "uid" && $scope.user)
              $scope.value = $scope.user;
          else if($scope.field == "pid" && $scope.post)
              $scope.value = $scope.post;
          else if($scope.field == "cid" && $scope.comment)
              $scope.value = $scope.comment;
          if($scope.type === "doi")
              var CreateGraph = $resource(config.apiUrl + 'doi/complete/'+ $scope.field +'/'+ $scope.value, {"max_size": $scope.doiSize});
          else
              var CreateGraph = $resource(config.apiUrl + 'createGraph/'+ $scope.field +'/'+ $scope.value);
          var creategraph = CreateGraph.get();
          creategraph.$promise.then(function (result) {
              var drawGraph = $resource(config.apiUrl + 'draw/'+ result.gid +'/'+ $scope.layoutChoice);
              var drawgraph = drawGraph.get();
              drawgraph.$promise.then(function (result) {
                  $scope.graphSigma = result;
              });
          });
      };

      /*** Sigma Event Catcher  ***/
      $scope.eventCatcher = function (e) {
          switch(e.type) {
              case 'clickNode':
                  if(e.data.node.uid != undefined) {
                      $scope.elementType = "uid";
                      $scope.elementId = e.data.node.uid;
                  }
                  else if(e.data.node.pid != undefined) {
                      $scope.elementType = "pid";
                      $scope.elementId = e.data.node.pid;
                  }
                  else if(e.data.node.cid != undefined) {
                      $scope.elementType = "cid";
                      $scope.elementId = e.data.node.cid;
                  }
                  $scope.openModal($scope.elementType, $scope.elementId);
                  break;
          }
      };
      /********* Modal  ***************/
      $scope.openModal = function (type, id) {
          $scope.elementType = type;
          $scope.elementId = id;

          var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'views/ui-elements/modal-view.html',
              controller: 'ModalInstanceCtrl',
              buttons: {
                  Cancel: function () {
                      $("#modal_dialog").dialog("close");
                  }
              },
              resolve: {
                  scopeParent: function() {
                      return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                  }
              }
          });

          // Catch return, reopen a new modal ?
          modalInstance.result.then(function (res) {
              if(res != undefined) {
                  res = res.split(':');
                  $scope.openModal(res[0], res[1]);
              }
          });
      };

      /*** Search Bar Catcher *****/
      $rootScope.$watch('search', function(newVal) {
          if(newVal != undefined) {
              if( newVal.uid != undefined) {
                  $scope.field = "uid";
                  $scope.value = newVal.uid;
              }
              else if( newVal.pid != undefined) {
                  $scope.field = "pid";
                  $scope.value = newVal.pid;
              }
              else if( newVal.cid != undefined) {
                  $scope.field = "cid";
                  $scope.value = newVal.cid;
              }
              $scope.drawDoiGraph();
          }
      });
      $scope.$on("$destroy", function(){
          //todo stop all active request
          // remove watchers in rootScope
          angular.forEach($rootScope.$$watchers, function(watcher, key) {
              if(watcher.exp === 'search' || watcher.exp === 'ready')
                  $rootScope.$$watchers.splice(key, 1);
          });
      });
});
