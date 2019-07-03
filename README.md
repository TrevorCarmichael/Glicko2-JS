#Glicko2 implementation for Javascript

Install:
```
npm install Glicko2-JS
```

Usage:
```
var Glicko = require('./Glicko2');

var ratings = new Glicko(1.2);

//Add players
//Fields are: 
//Name, Rating, RD, Volatility
ratings.addPlayer("One", 1500, 200, 0.06);
ratings.addPlayer("Two", 1400, 30, 0.06);
ratings.addPlayer("Three", 1550, 100, 0.06);
ratings.addPlayer("Four", 1700, 300, 0.06);
ratings.addPlayer("Five", 1500, 200, 0.5);

//Add matches in (winner,loser) format. Add 3rd parameter 'true' for tie. 
ratings.addMatch("One", "Two");
ratings.addMatch("Three", "One");
ratings.addMatch("Four", "One");
ratings.addMatch("One", "Four");
ratings.addMatch("One", "Two");
ratings.addMatch("One", "Three");

//View users to console
ratings.output();

//Calculate the input matches and update the users.
ratings.calculateRankings();

//View new players, sorted by Rating ascending
newplayers = ratings.getPlayers().sort((a,b) => (Number.parseFloat(a.rating) > Number.parseFloat(b.rating)) ? 1 : -1);
console.log(newplayers);
```

Info on the algorithm can be found here: http://www.glicko.net/glicko.html
Take a look, it's cool.