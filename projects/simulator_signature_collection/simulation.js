var app = angular.module("simulationApp", [],function($locationProvider){
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.controller("mainController", function ($scope, $window ,$location) {

    const parameters = $location.search();
    $scope.nodeCount = parameters.nodeCount;
    $scope.signatureCount = parameters.signatureCount;
    $scope.faultyNodeCount = parameters.faultyNodeCount;

    $scope.cpuCoreCount = $window.navigator.hardwareConcurrency;
    $scope.iterationCount = 100000;

    $scope.showProgressBar = true;

    $scope.expo = function(x, f) {
        return Number.parseFloat(x).toExponential(f);
    }

    $scope.drawChartOne = function(statData){
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Measured number of leaders');
        data.addColumn('number', 'Measured probabilities');

        if(statData){
            data.addRows(statData);
        }
        
        var options = {
          hAxis: {
            title: 'Measured number of leaders'
          },
          vAxis: {
            title: 'The Measured probability'
          },
          legend: {position: 'none'}
        };
  
        var chart = new google.visualization.LineChart(document.getElementById('chart_div_1'));
        chart.draw(data, options);
    }

    /***********************************/

    $scope.byzantinesWinCount = 0;
    $scope.systemStopCount = 0;


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }


    function getRandomUniqueNumbers(min, max, length){
        const result = [];

        while(result.length < length){
            const number = getRandomInt( min, max );
            const isInResult = result.find( x=> x === number);
            if(isInResult === undefined){
                result.push( number );
            }
        }

        return result;
    }

    function createNodeArray( length ){
        const nodes = [];

        for(var i = 0; i < length; i++){
            nodes.push(true);
        }

        return nodes;
    }

    function markByzantineNodes(nodes, byzantinNodes){
        byzantinNodes.forEach(index => {
            nodes[index] = false;
        });
    }

    const byzantineNodeIndexes = getRandomUniqueNumbers(0,$scope.nodeCount, $scope.faultyNodeCount );
    const nodes = createNodeArray($scope.nodeCount);
    markByzantineNodes(nodes, byzantineNodeIndexes);


    const workers = [];
    for(var i = 0; i < $scope.cpuCoreCount; i++){
        var worker = new Worker('simulation_worker.js');
        workers.push( worker );
    }

    const perWorkerIterationCount = $scope.iterationCount / $scope.cpuCoreCount;
    workers.forEach(simulation_worker => {
        simulation_worker.postMessage([nodes, $scope.signatureCount, perWorkerIterationCount  ]);
        simulation_worker.onmessage = statFromWorker;
    });


    

    const waitingStats = [];

    function statFromWorker (e) {
        const stats = e.data;


        if(stats.successfulFaultyNodeCount > 0){
            $scope.byzantinesWinCount += stats.successfulFaultyNodeCount;
            $scope.$apply();
            console.error("Byzantine nodes win: " + JSON.stringify(stats));
        }

        if(stats.successfulCorrectNodeCount > 0 || stats.successfulFaultyNodeCount > 0){
            
            //console.log("stats from worker: " + JSON.stringify(stats));
            waitingStats.push(stats);
            if(waitingStats.length % 1000 === 0){
                redrawChartOne(waitingStats);
            }

        }else{
            $scope.systemStopCount++;
            $scope.$apply();
            console.error("The system is stoped: " + JSON.stringify(stats));
        }
        
    }


    function redrawChartOne(waitingStats){


        const result = {};
        var sum = 0;

        waitingStats.forEach(stat => {
            if(result[ stat.successfulCorrectNodeCount ] === undefined){
                result[ stat.successfulCorrectNodeCount ] = 0;
            }
            result[ stat.successfulCorrectNodeCount ]++;
            sum++;
        });

        const chartData = [];
        for (const [key, value] of Object.entries(result)) {
            chartData.push( [ Number(key), value  / sum ] );
        }

        //console.log("Chart data : " + JSON.stringify(chartData));
        $scope.drawChartOne(chartData);
        updateProgressBar( $scope.iterationCount, (waitingStats.length + $scope.systemStopCount) );
    }


    function updateProgressBar( maxValue, currentValue ){

        const currentPercent = currentValue * 100 / maxValue;
        $(".progress-bar").css("width", currentPercent + "%");

        console.log("current percent: " + currentPercent);

        if( Math.ceil(currentPercent) === 100){
            $scope.showProgressBar = false;
            $scope.$apply();
        }

    }

});