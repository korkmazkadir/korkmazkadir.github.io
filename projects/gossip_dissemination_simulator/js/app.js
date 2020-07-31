var mainApp = angular.module("gossipDissemination", []);

mainApp.controller('mainController', function($scope) {
   
   const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

   const stringToColour = function(str) {
     var hash = 0;
     for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
     }
     var colour = '#';
     for (var i = 0; i < 3; i++) {
       var value = (hash >> (i * 8)) & 0xFF;
       colour += ('00' + value.toString(16)).substr(-2);
     }
     return colour;
   }

   const nodes = [];


   function createNode(id){
      return{
         id: id,
         neighbours:[],
         inbox:[],
         outbox:[],
         round: 1,
         logs:[],
         sizeFactor:1,
         processedMessages:[],
         range: -1,
         send:function(message){
            this.outbox.push(message);
         },
         deliver:function(){
            this.outbox.forEach( m => this.neighbours.forEach( n => n.inbox.push( m )));
            this.outbox.length = 0
            this.round++;
         },
         process: function(){
            this.inbox.forEach( m => {
               if(this.processedMessages.includes(m) === false){
                  this.logs.push(m);
                  this.send( m );
                  this.processedMessages.push( m );
               }
            })
            this.inbox.length = 0
            this.round++;
         },
         getColor:function(){
            if(this.logs.length === 0){
               return "steelblue";
            }else if(this.logs.length === 1){
               return this.logs[0].color;
            }
            var str = "";
            this.logs.forEach(l=> str = str +  l.message );

            return stringToColour(str);
         }
      };
   }


   function getRandomInt(max) {
     return Math.floor(Math.random() * Math.floor(max));
   }

   function createNodes(numberOfNodes){
      for(var i = 0; i < numberOfNodes ; i++){
         nodes.push(createNode(i));
      }
   }

   function assignNeighbours(numberOfNeighbours){

      Math.seedrandom(numberOfNeighbours + "");

      //clears neighbours
      nodes.forEach(n => { n.neighbours.length = 0});

      const maxNodeId = nodes.length;
      nodes.forEach( n => {
         //console.log("-----> Assigning neighbour for: " + n.id);
         var assignedNeighbours = 0;
         while(assignedNeighbours < numberOfNeighbours){

            const randomNumber = getRandomInt(maxNodeId);
            const selectedNeighbour = nodes[randomNumber];
            if(n.neighbours.includes(selectedNeighbour) === false){
               n.neighbours.push(selectedNeighbour);
               selectedNeighbour.neighbours.push(n);
               //console.log("=> " + selectedNeighbour.id);
               assignedNeighbours++;
            }
         }
         assignedNeighbours = 0;
      });
   }

   createNodes(3000);
   assignNeighbours(4);




   console.log("################## Results ##############################");
   //nodes.forEach(n => {
   //   console.log("-----------> Node: " + n.id);
   //   n.logs.forEach(l => console.log(l) );
   //})


   function areThereMessagesToProcess(numberOfProcessedMessages){
      return !nodes.every(n => n.processedMessages.length === numberOfProcessedMessages);
   }


   function areThereProcessWithoutRange(){
      return !nodes.every(n => n.range !== -1);
   }


   function assignRanges(centerNode){

      //clears ranges
      nodes.forEach(n => { n.range = -1});

      var range = 0;
      centerNode.range = range;
      var waitingToAssignRange = centerNode.neighbours;
      var temporary = [];
      while(areThereProcessWithoutRange()){
         range++;
         waitingToAssignRange.forEach(n => {
            if(n.range === -1){
               n.range = range;
               temporary = temporary.concat(n.neighbours);
            }
         })
         waitingToAssignRange = temporary.slice();
         temporary.length = 0;
      }
      console.log("Max range is " + range);
   }


   $scope.getNumberOfNodes = function(){
      return nodes.length;
   }

   $scope.centerNode = nodes.length /2;
   $scope.updateNetwork = function(){
      console.log($scope.centerNode);
      const centerNode = nodes[$scope.centerNode];
      assignRanges(centerNode);
      console.log("Center node range: " + centerNode.range);
      updateNetwork(nodes);
   }

   $scope.degree = 3;
   $scope.updateDegree = function(){
      assignNeighbours($scope.degree);
      const centerNode = nodes[$scope.centerNode];
      assignRanges(centerNode);
      updateNetwork(nodes);
   }



   $scope.showMessageModal = function(){
      $('#messageScheduleModal').modal("show");
   }


   $scope.scheduledMessages = [];
   $scope.newScheduledMessage = {};
   $scope.addNewMessage = function(){
      $scope.newScheduledMessage.color = stringToColour($scope.newScheduledMessage.message);
      console.log("color is " + $scope.newScheduledMessage.color);
      $scope.scheduledMessages.push($scope.newScheduledMessage);
      $scope.newScheduledMessage = {};
   }

   $scope.deleteMessage = function(messageToDelete){
      $scope.scheduledMessages = $scope.scheduledMessages.filter(m => 
         m.nodeId !== messageToDelete.nodeId && m.message !== messageToDelete.message && m.color !== messageToDelete.color);
   }


   $scope.enum = {
      initial:"initial",
      sending:"sending",
      reset:"reset"
   };

   $scope.simulationMode = $scope.enum.initial;
   $scope.sendMessages = function(){
      $('#messageScheduleModal').modal("hide");
      $scope.simulationMode = $scope.enum.sending;
      $scope.scheduledMessages.forEach(m => {
         nodes[m.nodeId ].inbox.push(m);
         nodes[m.nodeId ].process();
         nodes[m.nodeId ].deliver();
         nodes[m.nodeId ].sizeFactor = 2;
      });
      updateNetwork(nodes);
   }

   
   var counter = 1;
   $scope.moveNext = function(){
      if(areThereMessagesToProcess($scope.scheduledMessages.length)){
         console.log("Running iteration: " + counter);

         nodes.forEach(n => {
            n.process();
         });


         nodes.forEach(n => {
            n.deliver();
         });

         counter++;
      }else{
         $scope.simulationMode = $scope.enum.reset;
      }
      updateNetwork(nodes);
   }


   $scope.reset = function(){
      
      nodes.forEach( n => {
         n.round = 1;
         n.logs.length = 0;
         n.sizeFactor = 1;
         n.processedMessages.length = 0;
         n.inbox.length = 0;
         n.outbox.length = 0;
      });
      $scope.scheduledMessages = [];
      $scope.newScheduledMessage = {};
      $scope.simulationMode = $scope.enum.initial;

      updateNetwork(nodes);
   }



   //$scope.updateNetwork();
   
   assignRanges(nodes[$scope.centerNode]);
   drawNetwork(nodes);

/*
      var counter = 1;
      while(areThereMessagesToProcess(2)){
         console.log("Running iteration: " + counter);

         nodes.forEach(n => {
            n.process();
            n.deliver();
         });

         counter++;

         if(counter > 20){
            break;
         }
      }

*/

});