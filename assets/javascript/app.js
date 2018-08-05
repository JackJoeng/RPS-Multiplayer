var config = {
    apiKey: "AIzaSyAE6TvE7ONcv1s4A5KUlkzhZl3F8YpSiss",
    authDomain: "rpsgame-68a02.firebaseapp.com",
    databaseURL: "https://rpsgame-68a02.firebaseio.com",
    projectId: "rpsgame-68a02",
    storageBucket: "rpsgame-68a02.appspot.com",
    messagingSenderId: "17935976829"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  
  
  var startGame = true;
  
  var players = {
    p1 : {
      key:    "",
      name:   "",
      wins:   0,
      losses: 0
    },
    p2 : {
      key:    "",
      name:   "",
      wins:   0,
      losses: 0
    }
  };
  var user = {
    role: "",
    key:  ""
  };
  
  var turn = 0;
  var round = 1;
  var totalRounds = 5;
  var connectionsCounter;
  var p1key;
  var p2key;
  
  
  database.ref("/players").on("value", function(snapshot) {
    if (snapshot.child("1/name").exists()) {
      players.p1.name = snapshot.child("1/name").val();
      $(".player1 h4").html(players.p1.name);
      p1key = snapshot.child("1/key").val();
    }
    if (snapshot.child("2/name").exists()) {
      players.p2.name = snapshot.child("2/name").val();
      $(".player2 h4").html(players.p2.name);
      p2key = snapshot.child("2/key").val();
      $("#joinForm").hide();
    }
  
  });
  
  
  database.ref("/game").on("value", function(turnsnap) {
    if(turnsnap.child("turn").exists()) {
      switch (turnsnap.val().turn) {
        case 0:
          break;
        case 1:
          $(".chatbox").slideDown();
          resetChoices();
          if (user.role === "player1") {
            status("It's your turn now!");
            $(".player1 button").css("visibility", "visible");
            enableChoices(user.role);
            disappear(".player2 button");
          }
          if (user.role === "player2") {
            status("Waiting for" + players.p1.name);
            disappear(".player1 button");
          }
          break;
        case 2:
          if (user.role === "player1") {
            status("Waiting for" + players.p2.name);
          }
          if (user.role === "player2") {
            status("It's your turn now!");
            $(".player2 button").css("visibility", "visible");
            enableChoices(user.role);
          }
          break;
        case 3:
          status("Result");
          var p1choice = turnsnap.val().p1choice.toLowerCase();
          var p2choice = turnsnap.val().p2choice.toLowerCase();
          $(".card button").css("visibility", "visible");
          $(".player1 ."+p1choice).addClass('active');
          $(".player2 ."+p2choice).addClass('active');
          determineWinner(p1choice, p2choice);
          break;
      } 
    }
  });
  
  database.ref("/chatbox").orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot){
    var output = "<div class='shout'><span class='speaker'>";
    output += snapshot.val().name;
    output += ":</span> <span class='shoutContent'>";
    output += snapshot.val().message;
    output += "</span></div>";
    $(".shouts").append(output);
  });
  
  
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  
  
  connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(true);
      user.key = con.key;
      con.onDisconnect().remove();
    }
  });
  
  
  connectionsRef.on("value", function(snap) {
    $("#watchers").html("Number of players currently online: "+snap.numChildren());
  });
  
  connectionsRef.on("child_removed", function(removed) {
    if (removed.key === p1key) {
      status(players.p1.name + " disconnected!");
      database.ref("/players/1").remove();
      players.p1.name = "";
      if(user.role!=="player2") {
        $("#joinForm").show();
      }
      user.role = "";
      resetRound();
    } else if(removed.key === p2key) {
      status(players.p2.name + " disconnected!");
      database.ref("/players/2").remove();
      players.p2.name = "";
      if(user.role!=="player1") {
        $("#joinForm").show();
      }
      user.role = "";
      resetRound();
    }
  });
  
  function disappear(e) {
    $(e).css("visibility", "hidden");
  }
  
  function toTitleCase(str)
  {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
  
  function disableChoices(player) {
    $(player).prop("disabled", true);
    $(player).siblings().prop("disabled", true);
  }
  
  function enableChoices(player) {
    $("."+player+" button").prop("disabled", false);
  }
  
  function status(msg) {
    $(".status").html(msg);
  }
  
  function clearResults() {
    $(".result .card-text").html("");
  }
  
  function determineWinner(a, b) {
    if (a === b) {
      $(".result .card-text").html("It's a tie!");
    } else if (a === "rock" && b === "paper") {
      $(".result .card-text").html(players.p2.name+ " wins!");
      players.p1.losses++;
      players.p2.wins++;
    } else if (a === "rock" && b === "scissor") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "paper" && b === "rock") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "paper" && b === "scissor") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p1.losses++;
      players.p2.wins++;
    } else if (a === "scissor" && b === "rock") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p1.losses++;
      players.p2.wins++;
    } else if (a === "scissor" && b === "paper") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "lizard" && b === "scissor") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "lizard" && b === "rock") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "scissor" && b === "lizard") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "rock" && b === "lizard") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "lizard" && b === "paper") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "paper" && b === "lizard") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "spock" && b === "paper") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "paper" && b === "spock") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "scissor" && b === "spock") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "rock" && b === "spock") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "spock" && b === "scissor") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "spock" && b === "rock") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    } else if (a === "spock" && b === "lizard") {
      $(".result .card-text").html(players.p1.name+" wins!");
      players.p1.wins++;
      players.p2.losses++;
    } else if (a === "lizard" && b === "spock") {
      $(".result .card-text").html(players.p2.name+" wins!");
      players.p2.wins++;
      players.p1.losses++;
    }
    $("#scorePlayer1").html("Wins: "+players.p1.wins+" / Losses: "+players.p1.losses);
    $("#scorePlayer2").html("Wins: "+players.p2.wins+" / Losses: "+players.p2.losses);
    database.ref("/players/1").update({
      wins  : players.p1.wins,
      losses: players.p1.losses
    });
    database.ref("/players/2").update({
      wins  : players.p2.wins,
      losses: players.p2.losses
    });
  
    setTimeout(resetRound, 3000);
  }
  
  function resetRound() {
    turn = 1;
    database.ref("/game").update({
      turn      : turn,
      p1choice  : "",
      p2choice  : ""
    });
    resetChoices();
    clearResults();
  }
  
  function resetChoices(){
    $(".card button").removeClass('active');
  }
  
  
  $(document).ready(function() {
  
  
    $("#joinForm").submit(function(event){
      event.preventDefault();
      if (players.p1.name==="") {
        players.p1.name = toTitleCase($("#nameInput").val().trim());
        user.role = "player1";
  
  
        $(".player1 h4").html(players.p1.name);
        status(players.p1.name+" joined the game! Waiting for another player to start.");
        database.ref("/players/1").update({
          key   : user.key,
          name  : players.p1.name,
          wins  : players.p1.wins,
          losses: players.p1.losses
        });
        //
        turn = 0;
        database.ref("/game").update({
          turn: turn
        });
  
        $(this).hide();
      } else if (players.p2.name===""){
        players.p2.name = toTitleCase($("#nameInput").val().trim());
        user.role = "player2";
        $(".player2 h4").html(players.p2.name);
        database.ref("/players/2").update({
          key   : user.key,
          name  : players.p2.name,
          wins  : players.p2.wins,
          losses: players.p2.losses
        });
        status(players.p2.name+" joined the game! Waiting for another player to start.");
        turn = 1;
        database.ref("/game").update({
          turn: turn
        });
      }
  
    });
  
  
    $(".player button").click(function(){
      $(this).addClass('active');
      var choice = $(this).text();
      var parent = $(this).parent().parent();
      disableChoices(this);
      if (parent.hasClass("player1")) {
        turn = 2;
        database.ref("/game").update({
          p1choice  : choice,
          turn      : turn
        });
        status("You chose"+ p1choice+". Waiting for "+players.p2.name+"...");
      } else {
        turn = 3;
        database.ref("/game").update({
          p2choice  : choice,
          turn      : turn
        });
      }
    });
  
    $("#shoutForm").submit(function(event){
      event.preventDefault();
      var message = $("#shoutMessage").val().trim();
      $("#shoutMessage").val("");
      var shoutUser;
      if(user.role==="player1") {
        shoutUser = players.p1.name;
      } else if (user.role==="player2") {
        shoutUser = players.p2.name;
      }
      database.ref("/chatbox").push({
        name    : shoutUser,
        message : message
      });
  
    });
  
    if(startGame) {
      $("#clearButton").show();
      $("#clearButton").click(function(event){
        event.preventDefault();
        database.ref().remove()
        .then(function() {
          location.reload();
        });
  
      });
    }
  
  }); 
  
  function myFunction() {
    var x = document.getElementById("myInput");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
  }
  
  