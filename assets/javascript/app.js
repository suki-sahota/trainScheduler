// INITIALIZE FIREBASE
// __________________________________________________
const config = {
  apiKey: firebaseInfo.apiKey,
  authDomain: firebaseInfo.authDomain,
  databaseURL: firebaseInfo.databaseURL,
  projectId: firebaseInfo.projectId,
  storageBucket: firebaseInfo.storageBucket,
  messagingSenderId: firebaseInfo.messagingSenderId
};
firebase.initializeApp(config);


// DATABASE VARIABLE
// __________________________________________________
const database = firebase.database();


// FUNCTIONS
// __________________________________________________
function lastTrain(firstTrain, frequency) {
  // Find the number of minutes that have passed since the most recent train departed
  const tRemainder = moment().diff(moment.unix(firstTrain), "minutes") % frequency;
  return tRemainder;
}

function nextTrain(frequency, tRemainder) {
  // Find the number of minutes until the next train arrives
  const tMinutes = frequency - tRemainder;
  return tMinutes;
}

function nextTrainTime(tMinutes) {
  // Find out what time the next train will arrive
  const tArrival = moment().add(tMinutes, "m").format("hh:mm A");
  return tArrival;
}


// EVENTS
// __________________________________________________
$("#submit").on("click", function() {
  event.preventDefault();
  // Store user input
  const newTrainName = $("#train-name").val().trim();
  const newDestination = $("#destination").val().trim();
  const newFirstTrain = moment($("#first-train").val().trim(), "HH:mm").subtract(1, "years").format("X");
  const newFrequency = $("#freq").val().trim();

  // Calculate what time the next train comes in to the station
  const newTRemainder = lastTrain(newFirstTrain, newFrequency);
  const newTMinutes = nextTrain(newFrequency, newTRemainder);
  const newTArrival = nextTrainTime(newTMinutes);

  // Create an object to hold user input data
  const newTrain = {
    name: newTrainName,
    destination: newDestination,
    firstTrain: newFirstTrain,
    frequency: newFrequency,
    tArrival: newTArrival
}

  // Push new child (newTrain) to the realtime database
  database.ref().push(newTrain);

  // Clears text from input areas in our form
  $("#train-name").val("");
  $("#destination").val("");
  $("#first-train").val("");
  $("#freq").val("");
});


// MAIN PROCESS
// __________________________________________________
database.ref().on("child_added", function(childSnapshot) {
  // Locate the new train's information from our database
  const trainName = childSnapshot.child("name").val();
  const destination = childSnapshot.child("destination").val();
  const firstTrain = childSnapshot.child("firstTrain").val();
  const frequency = childSnapshot.child("frequency").val();
  
  // Re-calculate the tArrival to ensure our schedule displays up to date time
  const tRemainder = lastTrain(firstTrain, frequency);
  const tMinutes = nextTrain(frequency, tRemainder);
  const tArrival = nextTrainTime(tMinutes);

  // Add train's data into our .table
  $(".table").append("<tr><td>" + trainName + "</td><td>" + destination + "</td><td>" + frequency + "</td><td>" + tArrival + "</td><td>" + tMinutes + "</td></tr>");
});