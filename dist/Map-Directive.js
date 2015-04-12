directive('mapDisplay', function () {
    return {
        restrict: 'E',
        scope: {
            bounds : '=',
            map    : '=',
            data   : '='
        },
        templateUrl: appHelper.templatePath('custom/map/map-display'),
        controller: function($scope, $state, $timeout, $location, $document, uiGmapGoogleMapApi, $geolocation, ProjectService, GoogleMapStyles) {
            // Setup Marker click functions -----------------------------------------
            $scope.highlightProject = function(id){
                id = id || $location.hash()
                var highlightElement = angular.element(document.getElementById('PS'+id))
                $document.scrollToElement(highlightElement, 75, 500).then(function() {
                    highlightElement.removeClass("highlight-anim");
                    $timeout(function() {highlightElement.addClass("highlight-anim")},1);
//                    $timeout(function(){highlightElement.css({outline    : '10px solid rgba(255, 255, 0, 0.0)'})}, 0);
//                    $timeout(function(){highlightElement.css({transition : 'outline 0.5s linear'})}, 50);
//                    $timeout(function(){highlightElement.css({outline    : '10px solid rgba(255, 255, 0, 0.2)'})}, 100);
//                    $timeout(function(){highlightElement.css({outline    : '10px solid rgba(255, 255, 0, 0.0)'})}, 3000);
                });
            }

            $scope.getLocation = function(){
                $geolocation.getCurrentPosition({
                    timeout: 60000,
                    enableHighAccuracy: true
                }).then(function (position) {
                    $scope.map.center.latitude  = position.coords.latitude;
                    $scope.map.center.longitude = position.coords.longitude;
                    $scope.map.zoom             = 13;
                });
            }

            // Map Styles and options ----------------------------------------------
            $scope.styles = Object.keys(GoogleMapStyles);
            $scope.setOptions = function(){
                $scope.options = {
                    mapTypeControl: false,
                    streetViewControl: false,
                    panControl: false,
                    minZoom : 3,
                    styles : GoogleMapStyles[$scope.style]
                };
            }
            $scope.styleCount = 0;
            var stylesLength = $scope.styles.length;
            $scope.nextStyle = function(){
                $scope.style = $scope.styles[$scope.styleCount % stylesLength];
                $scope.setOptions();
                $scope.styleCount++;
            }
            $scope.nextStyle();

            // Map Intial settings ------------------------------------------------
            // Here we will initialise the map parameters, center, zoom and bounds
            // We look up location state param, if it exists, we use it.
            // If it does not exist, we request for user's location with html5 geolocation
            // If request is denied, we use the following:

            $scope.map = {
                center: {
                    latitude  : 16,
                    longitude : 53
                },
                zoom: 3,
                bounds : {}
            };

            var getHtmlGeolocation = true;
            if($state.params.location){
                // Split location from State Param [latitude, longitude, level]
                var location = $state.params.location.split(',');
                // Confirm the location from State Params is of length 3
                if (location.length == 3){
                    // If it is, set the map properties
                    $scope.map.center.latitude  = location[0];
                    $scope.map.center.longitude = location[1];
                    $scope.map.zoom             = parseInt(location[2]);
                    // If valid, we do not use geolocation
                    getHtmlGeolocation = false;
                }
                // Else, the state params were invalid, we use Html Geolocation
            }

            if (getHtmlGeolocation){
                $scope.getLocation()
                // If the promise never returns, we'll get the initial map params
            }

            // Initiate Map ------------------------------------------------------
            // Initialise points array
            $scope.points=[];
            uiGmapGoogleMapApi.then(function(maps) {
                // Map watcher
                $scope.$watch('map', function (nv, ov) {
                    if (nv.bounds != ov.bounds){
                        // Set the bounds
                        $scope.bounds = nv.bounds;
                        // Update Location State Params
                        var mapState = $scope.map.center.latitude+','+$scope.map.center.longitude+','+$scope.map.zoom
                        $state.current.reloadOnSearch = false;
                        $location.search('location', mapState);
                        $timeout(function () { $state.current.reloadOnSearch = undefined;});
                    }
                }, true);

                $scope.$watch('data', function (nv, ov) {
                    // TODO: address this issue where projects with no location are returned. how?
                    var points = _.compact(_.map($scope.data, function(project) {
                        if (project.location[0]) {
                            // Generate offset from the last 4 characters of hexadecimal id from -1 to +1
                            var offset1 = ((parseInt(project._id.substr(20, 4),16)/Math.pow(16, 4) )-0.5)*2;
                            var offset2 = ((parseInt(project._id.substr(16, 4),16)/Math.pow(16, 4) )-0.5)*2;
                            var ret = {
                                id        : project._id,
                                title     : project.name,
                                latitude  : project.location[0].coords[0] + offset1/2000,
                                longitude : project.location[0].coords[1] + offset2/2000,
                                show      : false,
                                onClick   : function () {
                                    $scope.highlightProject(ret.id);
                                }
                            }
                            return ret;
                        }
                    }));
                    $scope.points = points;
                });
            });
        }
    }
}).