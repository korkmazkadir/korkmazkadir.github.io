var app = angular.module("statsCalculater", []);

app.controller("mainController", function ($scope,$window) {
    $scope.Math = window.Math;
    $scope.faultyNodeCount = 200;
    $scope.nodeCountCoefficient = 5;
    $scope.signatureCountCoefficient = 5;

    //$scope.nodeCount = $scope.faultyNodeCount * $scope.nodeCountCoefficient;
    //$scope.signatureCount = Math.ceil($scope.signatureCountCoefficient * Math.log10( $scope.nodeCount ));


    $scope.anHonestLeaderWins = function () {
        const nodeCount = $scope.faultyNodeCount * $scope.nodeCountCoefficient;
        const signatureCount = Math.ceil($scope.signatureCountCoefficient * Math.log10(nodeCount));
        const faultyNodeCount = $scope.faultyNodeCount;
        const correctNodeCount = nodeCount - faultyNodeCount;

        console.log("node count: " + nodeCount + " signature count: " + signatureCount);



        var anHonestNodeWins = 1;
        for (var i = 1; i <= signatureCount; i++) {
            anHonestNodeWins = anHonestNodeWins * ((correctNodeCount - i) / (nodeCount - i));
            //console.log( ( correctNodeCount - i ) + " / " + (nodeCount - i) );
        }

        return anHonestNodeWins;
    };

    $scope.honestNodesLoose = function () {
        const result = $scope.expextedNumberOfCorrerctLeaders();

        return result[0];
    }

    $scope.aByzantineLeaderWins = function () {
        const nodeCount = $scope.faultyNodeCount * $scope.nodeCountCoefficient;
        const signatureCount = Math.ceil($scope.signatureCountCoefficient * Math.log10(nodeCount));
        const faultyNodeCount = $scope.faultyNodeCount;

        var aByzantineLeaderWins = 1;
        for (var i = 1; i <= signatureCount; i++) {
            aByzantineLeaderWins = aByzantineLeaderWins * ((faultyNodeCount - i) / (nodeCount - i));
            //console.log( ( faultyNodeCount - i ) + " / " + (nodeCount - i) );
        }

        return aByzantineLeaderWins;
    };

    $scope.meanProbabilityOfByzantineNodesWins = function(){

        const faultyNodeCount = $scope.faultyNodeCount;
        const p = $scope.aByzantineLeaderWins();
        const q = 1-p;

        var result = 0;
        for(var i = 0; i <= faultyNodeCount ; i++){
            const probability = math.combinations(faultyNodeCount, i) * Math.pow( p, i ) * Math.pow( q, faultyNodeCount- 1 );
            if(isFinite(probability) && probability !== 0){
                result += probability * i;
            }
        }


        return result;
    };


    $scope.expextedNumberOfCorrerctLeaders = function () {

        const nodeCount = $scope.faultyNodeCount * $scope.nodeCountCoefficient;
        const faultyNodeCount = $scope.faultyNodeCount;
        const correctNodeCount = nodeCount - faultyNodeCount;

        const result = {};
        const pHonestLeaderWins = $scope.anHonestLeaderWins();

        for (var i = 0; i <= correctNodeCount; i++) {

            const r = math.combinations(correctNodeCount, i) * Math.pow(pHonestLeaderWins, i) * Math.pow(1 - pHonestLeaderWins, correctNodeCount - i)

            result[i] = r;
        }

        return result;
    };


    $scope.showExpextedNumberOfCorrerctLeaders = function () {
        const result = $scope.expextedNumberOfCorrerctLeaders();

        const results = [];
        for (const [key, value] of Object.entries(result)) {
            if (isFinite(value) && value !== 0) {
            //if (isFinite(value) ) {
                results.push(`[${key}]: ${value} \n`);
            }
        }

        //return JSON.stringify(result, null, 4);
        return results.join("").trim();
    }

    $scope.drawChartExpextedNumberOfCorrerctLeaders = function () {
        const result = $scope.expextedNumberOfCorrerctLeaders();

        const charData = [];
        for (const [key, value] of Object.entries(result)) {
            if (isFinite(value) && value !== 0) {
                charData.push([Number(key), value]);
            }
        }

        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Expected number of leaders');
        data.addColumn('number', 'The probability');

        data.addRows(charData);

        var options = {
            hAxis: {
                title: 'The Expected Number of Successful Leaders'
            },
            vAxis: {
                title: 'Probability'
            },
            legend: {position: 'none'}
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_container'));

        chart.draw(data, options);
    }

    $scope.inputUpdated = function () {
        $scope.drawChartExpextedNumberOfCorrerctLeaders();
    }

    $scope.openSimulationTab = function () {

        const nodeCount  = $scope.faultyNodeCount * $scope.nodeCountCoefficient;
        const signatureCount = Math.ceil($scope.signatureCountCoefficient * Math.log10(nodeCount));
        const faultyNodeCount = $scope.faultyNodeCount;

        const link = `./simulation.html?nodeCount=${nodeCount}&signatureCount=${signatureCount}&faultyNodeCount=${faultyNodeCount}`;
        
        console.log(link);

        $window.open(link, '_blank');

    }


});

