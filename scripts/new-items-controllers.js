/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
/*backdrop: 'static'*/
/* Controllers */
/*http://192.168.0.149:8089/bpm/rule/queryAllRules?ruleCode&ruleName&ruleScript&order=asc&size=25&sort=id这是项目请求的完整带参数路径，post下测试可以访问
* http://192.168.0.149:8089/bpm/rule/queryAllRules?callback=JSON_CALLBACK?ruleCode&ruleName&ruleScript 这是jsonp请求 可以避开跨域问题 但是测试无法取到数据
*/

flowableAdminApp.controller('NewItemsController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$translate', '$q', '$modal', 'gridConstants','$window',
    function ($rootScope, $scope, $http, $timeout, $location, $translate, $q, $modal, gridConstants) {

        $rootScope.navigation = {main: 'new-engine', sub: 'new-items'};

        $scope.filter = {};
        $scope.testItemsData = {"ruleCode":"1","ruleName":"1","ruleScript":"1"};

        // Array to contain selected properties (yes - we only can select one, but ng-grid isn't smart enough)
        //$scope.selectedItem = [];
        $scope.newItem = {};
        $scope.selectItem = {};
        $scope.newItemsData = [{
            "id": "1001965125284",
            "ruleCode": "02",
            "ruleName": "按照机构进行审批",
            "ruleScript": "import  org.springframework.jdbc.core.JdbcTemplate;",
            "ruleType": 1,
            "ret": 0,
            "msg": null
        },
            {
                "id": "1001965506604",
                "ruleCode": "03",
                "ruleName": "测试存储",
                "ruleScript": "import org.springframework.jdbc.core.JdbcTemplate;",
                "ruleType": 1,
                "ret": 0,
                "msg": null
            }];
        $scope.items = [];
        var filterConfig = {
            method: 'GET',
            url: 'http://192.168.0.149:8089/bpm/rule/queryAllRules?ruleCode',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            success: function (data, status, headers, config) {
                $scope.newItemsData = data;
            },
            error: function (data, status, headers, config) {
                if (data && data.message) {
                    // Extract error-message
                    $rootScope.addAlert(data.message, 'error');
                } else {
                    // Use default error-message
                    $rootScope.addAlert($translate.instant('ALERT.GENERAL.HTTP-ERRORCN'), 'error');
                }
            },

            sortObjects: [
                {name: 'NEW-ITEMS.SORT.ID', id: 'id'},
                {name: 'NEW-ITEMS.SORT.NUMBER', id: 'number'}
            ],

            supportedProperties: [
                {id: 'ruleName', name: 'NEW-ITEMS.FILTER.NAMECN', showByDefault: true},
                {id: 'id', name: 'NEW-ITEMS.FILTER.ID', showByDefault: true}
            ]
        };

        if ($rootScope.filters && $rootScope.filters.newItemFilter) {
            // Reuse the existing filter
            $scope.filter = $rootScope.filters.newItemFilter;
            $scope.filter.config = filterConfig;
        } else {
            $scope.filter = new FlowableAdmin.Utils.Filter(filterConfig, $http, $timeout, $rootScope);
            $rootScope.filters.newItemFilter = $scope.filter;
        }

        $scope.itemSelected = function (row) {
            $scope.selectItem = row.entity;
        };

        $q.all([$translate('NEW-ITEMS.HEADER.ID'),
                $translate('NEW-ITEMS.HEADER.NUMBER'),
                $translate('NEW-ITEMS.HEADER.RULETYPE'),
                $translate('NEW-ITEMS.HEADER.NAME'),
                $translate('NEW-ITEMS.HEADER.SCRIPT')])
            .then(function (headers) {
                // Config for grid
                $scope.gridNewItems = {
                    data: 'newItemsData',
                    enableRowReordering: true,
                    multiSelect: false,
                    keepLastSelected: false,
                    rowHeight: 36,
                    afterSelectionChange: $scope.itemSelected,
                    columnDefs: [
                        {field: 'id', displayName: headers[0], cellTemplate: gridConstants.defaultTemplate},
                        {field: 'ruleCode', displayName: headers[1], cellTemplate: gridConstants.defaultTemplate},
                        {field: 'ruleType', displayName: headers[2], cellTemplate: gridConstants.defaultTemplate},
                        {field: 'ruleName', displayName: headers[3], cellTemplate: gridConstants.defaultTemplate},
                        {field: 'ruleScript', displayName: headers[4], cellTemplate: gridConstants.defaultTemplate},
                      ]
                };
            });

        var addItemController = function($scope,$rootScope, $modalInstance, newItem){
            $scope.newItem = newItem;
            $scope.closeAddItem = function () {
                $modalInstance.close();
            };
            $scope.addItem = function (newItem) {
                alert(newItem.ruleName+newItem.ruleScript);
                $scope.test = newItem;
                $http({
                    method: 'POST',
                    url: 'http://192.168.0.149:8089/bpm/rule',
                    data: $scope.test,
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }).then(function successCallback(response) {
//  请求成功可以跳回页面 不用提示 下面那段代码拿进来
                    alert("添加成功！");
                }, function errorCallback(response) {
                    alert("添加失败！");
                });
                $scope.closeAddItem();
                setTimeout(function () {
                    $rootScope.reloadRoute();
                }, 500);
            };
        };

        var modifyItemController = function($scope, $rootScope,$modalInstance,selectItem){
           $scope.selectItem = selectItem;
            $scope.closeModifyItem =function () {
                $modalInstance.close();
            };
            $scope.modifyItem = function (selectItem) {
                $http({
                    method: 'POST',
                    url: 'http://192.168.0.149:8089/bpm/rule/'
                }).then(function successCallback(response) {
//  请求成功可以跳回页面 不用提示 下面那段代码拿进来
                    alert("修改成功！");
                }, function errorCallback(response) {
                    alert("修改失败！");
                });
                $scope.closeModifyItem();
                setTimeout(function () {
                    $rootScope.reloadRoute();
                }, 500);
            };
        };

        var deleteItemController = function($scope, $modalInstance, selectItem){
            $scope.selectItem = selectItem;
            $scope.closeDeleteItem =function () {
                $modalInstance.close();
            };
            $scope.deleteItem = function () {
                $http({
                    method: 'POST',
                    url: 'http://192.168.0.149:8089/bpm/rule/'
                }).then(function successCallback(response) {
//  请求成功可以跳回页面 不用提示 下面那段代码拿进来
                    alert("删除成功！");
                }, function errorCallback(response) {
                    alert("删除失败！");
                });
                $scope.closeDeleteItem();
                setTimeout(function () {
                    $rootScope.reloadRoute();
                }, 500);
            };
        };

        $scope.showAddItem = function () {
            $modal.open({
                templateUrl: 'views/showAddItem.html',
                backdrop:false,
                controller:addItemController,
                resolve:{
                    "newItem":function(){
                        return $scope.newItem;
                    }
                }
            });
        };

        $scope.showModifyItem = function(){
            if($.isEmptyObject($scope.selectItem)){
                alert("先选好你要修改的！")
            }else {
                $modal.open({
                    templateUrl: "views/showModifyItem.html",
                    backdrop: false,
                    controller: modifyItemController,
                    resolve: {
                        "selectItem": function () {
                            return $scope.selectItem;
                        }
                    }
                });
            };
        };

        $scope.showTestItem = function(){
            $scope.selectItem = {id:999,number:112,ruleType:1,name:"xiugai99",script:"scriptTest"};
        };

        $scope.showDeleteItem = function(){
            if($.isEmptyObject($scope.selectItem)){
                alert("先选好你要删哪一个！")
            }else {
                $modal.open({
                    templateUrl: "views/showDeleteItem.html",
                    backdrop: false,
                    controller: deleteItemController,
                    resolve: {
                        "selectItem": function () {
                            return $scope.selectItem;
                        }
                    }
                });
            };
        };

        $scope.executeWhenReady(function () {
            $scope.filter.refresh();
        });

        $rootScope.reloadRoute = function () {
            $scope.filter.refresh();
        };

    }]);