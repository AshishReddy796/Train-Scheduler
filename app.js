$(document).ready( function(){
config();
var databse;
function config(){
    var config = {
      apiKey: "AIzaSyA8BWQbLE--KpLgmpJM3bmDJG_IkIPqWJA",
      authDomain: "train-schedular-c7a4a.firebaseapp.com",
      databaseURL: "https://train-schedular-c7a4a.firebaseio.com",
      projectId: "train-schedular-c7a4a",
      storageBucket: "train-schedular-c7a4a.appspot.com",
      messagingSenderId: "764385867751"
    };
    firebase.initializeApp(config);
  
  database = firebase.database();
}

  $("#train-submit").click(function (){
    event.preventDefault();
    checkInputFieldsForNotNull();
  });
  
  trial();
  setInterval( function(){
    $('#table-body').remove();
    var newTable = $('<tbody id="table-body"></tbody');
    $("#table").append(newTable);
    trial();
  }, 100);

function trial(){
    var trainName;
    var trainNumber;
    var trainTime;
    var trainCoach;
    var trainPrice;
    var trainDelay;

  database.ref("trains").on("child_added", function (snapshot) {
    var childKey = snapshot.key;
    var childData = snapshot.val();

    var trainName = snapshot.val().trainName;
    var trainNumber = snapshot.val().trainNumber;
    var trainTime = snapshot.val().trainTime;
    var trainCoach = snapshot.val().trainCoach;
    var trainDelay = snapshot.val().trainDelay;


    //Current time in minutes ........................ good
    var currentTimeInMins = currentTimeInMins();
    function currentTimeInMins(){
        var currentHour = moment().get("hour");
        var currentMinutes = moment().get("minutes");
        var currentTimeString = currentHour + ":" + currentMinutes;
        var currentTime = moment(currentTimeString, "HH:mm").format("HH:mm");
        var currentTimeInMins = moment.duration(currentTime).asMinutes(); ////........
        return currentTimeInMins;
    }

    //First train time converted in minutes .................... good
    var firstTrainTimeInMins = firstTrainTimeInMins();
    function firstTrainTimeInMins(){
        var firstTrainTimeInMins = moment(trainTimeFirst, "HH:mm").format("HH:mm");
        firstTrainTimeInMins = moment.duration(firstTrainTimeInMins).asMinutes();
        return firstTrainTimeInMins;
    }

    //Time left or mins away from train arrival 
    var minsAway = minsAway();
  
    function minsAway(){
        if (firstTrainTimeInMins > currentTimeInMins ){
            var timeUntilMidnight = (1440-firstTrainTimeInMins);
            var firstTrainAndCurrentTimeDuration = timeUntilMidnight + currentTimeInMins;
            var minsLeftAfterMaxTrips = firstTrainAndCurrentTimeDuration % trainFrequency;
            var minsAway = trainFrequency - minsLeftAfterMaxTrips;
            return minsAway;
        }else{
            var differenceCurrentTimeAndFirstTrain = currentTimeInMins - firstTrainTimeInMins;
            var minsPastAfterMaxTrips = differenceCurrentTimeAndFirstTrain % trainFrequency;
            var minsAway = trainFrequency - minsPastAfterMaxTrips;
            return minsAway;
        }
    }

    //Next arrival train arrival time
    var nextArrival = nextArrival();
    function nextArrival(){
        var nextArrivalInMins = currentTimeInMins + minsAway;
        var nextArrivalFormatted = moment.duration(nextArrivalInMins, 'minutes');
        var nextArrivalInHrsAndMins = nextArrivalFormatted.format("hh:mm");
        var nextArrivalStandard = moment(nextArrivalInHrsAndMins, 'HH:mm').format('hh:mm a')

            return nextArrivalStandard;
    }
    // var deleteButton = $('<td><span class="glyphicon glyphicon-trash"></span></td>').click(function () {
    //     // database.ref("trains").remove(childKey);
    //     var nodeToBeDeleted = firebase.database().ref("trains/" + childKey);
    //     nodeToBeDeleted.remove().then( function (){
    //         console.log("data deleted");
    //     }).catch( function(error){
    //         console.log("Failed to remove");
    //     });
    // });

    // var editButton = $('<td><span class="glyphicon glyphicon-edit"></span></td>').click(function () {
    //     // pouplateDataInformForEdit();
    //     updateData();
    // });

       


    function pouplateDataInformForEdit(){
        database.ref("trains" +"/"+childKey).on("value", function (snapshot) {

            var childData = snapshot.val();
            var trainName = snapshot.val().trainName;
            var trainNumber = snapshot.val().trainNumber;
            var trainTime = snapshot.val().trainTime;
            var trainCoach = snapshot.val().trainCoach;
            var trainPrice = snapshot.val().trainPrice;
            var trainDealy = snapshot.val().trainDealy;

            $("#train-name").val(trainName);
            $("#train-number").val(trainNumber);
            $("#train-time").val(trainTime);
            $("#train-coach").val(trainCoach);
            $("#train-price").val(trainPrice);
            $("#train-delay").val(trainDelay);

        });
    }


        
    var newRows;
    
    if(minsAway == 1){
        var newRows = $('<tr><td style="width: 24.66%">' + trainName + '</td><td style="width: 21.66%">'
        + trainDestination + '</td><td style="width: 14.66%">'
        + trainFrequency + " Mins" + '</td><td style="width: 14.66%">'
        + nextArrival + '</td><td style="width: 12.66%">'
        + "Arriving ..." +'</td></tr style="width: 12.66%">');
    }else{
        var newRows = $('<tr><td style="width: 24.66%">' + trainName + '</td><td style="width: 21.66%">'
        + trainDestination + '</td><td style="width: 14.66%">'
        + trainFrequency +  " Mins" +'</td><td style="width: 14.66%">'
        + nextArrival + '</td><td style="width: 12.66%">'
        + minsAway + " Mins" +'</td></tr style="width: 12.66%">');
    }

// deleteButton.append(editButton);
// newRows.append(deleteButton);
newRows.append(editButton);
newRows.append(deleteButton);
$("#table-body").prepend(newRows);
});
}


//Function for clearing the input fields
function clearInputFields(){
    $('input[class="form-control"]').each(function (){
        $(this).val('');
    });
}

function checkInputFieldsForNotNull(){
    var trainName =  $("#train-name").val().trim();
    var trainNumber = $("#train-number").val().trim();
    var trainTime = $("#train-time").val().trim();
    var trainCoach = $("#train-coach").val().trim();
    var trainPrice = $("#train-price").val().trim();
    var trainDelay = $("#train-delay").val().trim();
    
    var firstTrainHrs = parseInt(trainTimeFirst.substring(0,2));
    var firstTrainMins = parseInt(trainTimeFirst.substring(3,5));

    if (trainName == "" || trainNumber == "" || trainTime == "" || trainCoach == ""){
        alert("Please fill up all the fields or fill in correct format");
    }else if (firstTrainHrs > 24 || firstTrainMins > 59 || trainTimeFirst.indexOf(":") !== 2){
        alert("Please enter values in correct format-  First train time should be between 00:00 - 23:59 and the freqeuncy should be a numer")
    }
    else{
        trainName =  $("#train-name").val().trim();
        trainNumber = $("#train-number").val().trim();
        trainTime = $("#train-time").val().trim();
        trainPrice = $("#train-price").val().trim();
        trainCoach = $("#train-coach").val().trim();
        trainDelay = $("#train-delay").val().trim();

    clearInputFields();
    database.ref("trains").push({
        trainName : trainName,
        trainNumber : trainNumber,
        trainTime : trainTime,
        trainCoach : trainCoach,
        trainPrice : trainPrice,
        trainDelay : trainDelay;
    });
   
    }
}

}); // Document. ready closing

//Handle errors 
//make editable