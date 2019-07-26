
function Glicko(tau){
    if(tau===undefined)
        this.tau = 0.5; 
    else
        this.tau = tau;

    this.players = [];
    this.matches = [];
}

Glicko.prototype.addPlayer = function addPlayer(name, rating, rd, volatility){
    this.players.push({
        name: name, 
        rating: rating,
        rd: rd,
        volatility: volatility,
        mu: (rating - 1500)/173.7178,
        phi: rd/173.7178
    });
}

Glicko.prototype.getPlayers = function getPlayers(){
    return this.players;
}
Glicko.prototype.getPlayerByName = function getPlayerByName(name) {
    return this.players.find(x => x.name === name);
}

Glicko.prototype.addMatch = function addMatch(winner, loser, tie){
    if(tie===true) {
        this.matches.push({
            user: winner,
            opponent: loser,
            result: 0.5
        });
        this.matches.push({
            user: loser,
            opponent: winner,
            result: 0.5
        });
    } else {
        this.matches.push({
            user: winner,
            opponent: loser, 
            result: 1
        });
        this.matches.push({
            user: loser,
            opponent: winner, 
            result: 0
        });
    }
}
Glicko.prototype.output = function output(){
    console.log(this.players);
}

Glicko.prototype.calculateRankings = function calculateRankings() {
    let g = (phi) => 1 / Math.sqrt(1 + (3 * Math.pow(phi, 2) / Math.pow(Math.PI, 2)));
    let E = (mu, muj, phi) => 1 / (1 + Math.exp(-1 * g(phi) * (mu - muj)));
    let v = (mu, muj, phi) => Math.pow(g(phi),2) * E(mu, muj, phi) * (1 - E(mu, muj, phi));
    let delta = (mu, muj, phi, score) => g(phi) * (score - E(mu, muj, phi));
    let a = (vol) => Math.log(Math.pow(vol, 2));
    let f_base = (delta, phi, v, a) => (x) => (
        (Math.pow(Math.E, x) * (Math.pow(delta, 2) - Math.pow(phi, 2) - v - Math.pow(Math.E, x)))/
        (2 * Math.pow((Math.pow(phi, 2) + v + Math.pow(Math.E, x)),2))) - ( (x-a) / Math.pow(this.tau,2) ); //what
    let epsilon = 0.000001;


    let newPlayers = [];

    this.players.forEach((player) => {
        let vtotal = 0;
        let deltaTotal = 0;
        let hasPlayed = false;
        this.matches.filter(x => x.user === player.name).forEach((match) => {
            let opponent = this.getPlayerByName(match.opponent);
            vtotal += v(player.mu, opponent.mu, opponent.phi);
            deltaTotal += delta(player.mu, opponent.mu, opponent.phi, match.result);
            hasPlayed = true;
        });
        if(hasPlayed){
            vtotal = Math.pow(vtotal, -1);
            let preDelta = deltaTotal;
            deltaTotal = deltaTotal * vtotal;
            let f = f_base(deltaTotal, player.phi, vtotal, a(player.volatility));
            let A = a(player.volatility);
            let B;
            if(Math.pow(delta, 2) > (Math.pow(player.phi, 2) + v)) {
                B = Math.log(Math.pow(delta, 2) - Math.pow(player.phi, 2) - vtotal);
            } else {
                let k = 1;
                while(f(a(player.volatility) - k * this.tau) < 0){
                    k +=1;
                }
                B = a(player.volatility) - (k * this.tau);
            }
            let fA = f(A);
            let fB = f(B);

            while(Math.abs(B - A) > epsilon) {
                let C = A + (((A - B) * fA) / (fB - fA));

                let fC = f(C);
                if((fC * fB) < 0) {
                    A = B;
                    fA = fB;
                } else {
                    fA = fA / 2;
                }
                B = C;
                fB = fC;
            }

            let newVolatility = Math.pow(Math.E, A.toFixed(5) / 2);
            let prePhi = Math.sqrt(Math.pow(player.phi, 2) + Math.pow(newVolatility, 2));
            let newPhi = 1 / Math.sqrt((1/Math.pow(prePhi,2)) + (1/vtotal));
            let newMu = player.mu + Math.pow(newPhi, 2) * (preDelta);
            let newRD = 173.7178 * newPhi;
            let newRating = 173.7178 * newMu + 1500;
            
            newPlayers.push({
                name: player.name,
                rating: Number.parseFloat(newRating),
                rd: Number.parseFloat(newRD),
                volatility: Number.parseFloat(newVolatility),
                mu: Number.parseFloat(newMu),
                phi: Number.parseFloat(newPhi)
            });
        } else {
            let newPhi = Math.sqrt(Math.pow(player.phi, 2) + Math.pow(player.volatility, 2));
            let newRD = 173.7178 * newPhi;

            newPlayers.push({
                name: player.name,
                rating: Number.parseFloat(player.rating),
                rd: Number.parseFloat(newRD),
                volatility: Number.parseFloat(player.volatility),
                mu: (player.rating - 1500)/173.7178,
                phi: newRD/173.7178
            });
        }
    });

    this.players = newPlayers;
    this.matches = [];
}

Glicko.prototype.calculateScore = function calculateScore(player1, player2, result) {
    let matchResult = (result===undefined) ? 1 : result;
    let g = (phi) => 1 / Math.sqrt(1 + (3 * Math.pow(phi, 2) / Math.pow(Math.PI, 2)));
    let E = (mu, muj, phi) => 1 / (1 + Math.exp(-1 * g(phi) * (mu - muj)));
    let v = (mu, muj, phi) => Math.pow(g(phi),2) * E(mu, muj, phi) * (1 - E(mu, muj, phi));
    let delta = (mu, muj, phi, score) => g(phi) * (score - E(mu, muj, phi));
    let a = (vol) => Math.log(Math.pow(vol, 2));
    let f_base = (delta, phi, v, a) => (x) => (
        (Math.pow(Math.E, x) * (Math.pow(delta, 2) - Math.pow(phi, 2) - v - Math.pow(Math.E, x)))/
        (2 * Math.pow((Math.pow(phi, 2) + v + Math.pow(Math.E, x)),2))) - ( (x-a) / Math.pow(this.tau,2) ); //what
    let epsilon = 0.000001;

    let player = player1;
    let opponent = player2;
    
    player.mu = (player.rating - 1500)/173.7178;
    player.phi = player.rd/173.7178;
    opponent.mu = (opponent.rating - 1500)/173.7178;
    opponent.phi = opponent.rd/173.7178;

    let vtotal = 0;
    let deltaTotal = 0;
    let hasPlayed = false;
    
    vtotal += v(player.mu, opponent.mu, opponent.phi);
    deltaTotal += delta(player.mu, opponent.mu, opponent.phi, matchResult);
    vtotal = Math.pow(vtotal, -1);

    let preDelta = deltaTotal;
    deltaTotal = deltaTotal * vtotal;
    let f = f_base(deltaTotal, player.phi, vtotal, a(player.volatility));
    let A = a(player.volatility);
    let B;
    if(Math.pow(delta, 2) > (Math.pow(player.phi, 2) + v)) {
        B = Math.log(Math.pow(delta, 2) - Math.pow(player.phi, 2) - vtotal);
    } else {
        let k = 1;
        while(f(a(player.volatility) - k * this.tau) < 0){
            k +=1;
        }
        B = a(player.volatility) - (k * this.tau);
    }
    let fA = f(A);
    let fB = f(B);

    while(Math.abs(B - A) > epsilon) {
        let C = A + (((A - B) * fA) / (fB - fA));

        let fC = f(C);
        if((fC * fB) < 0) {
            A = B;
            fA = fB;
        } else {
            fA = fA / 2;
        }
        B = C;
        fB = fC;
    }

    let newVolatility = Math.pow(Math.E, A.toFixed(5) / 2);
    let prePhi = Math.sqrt(Math.pow(player.phi, 2) + Math.pow(newVolatility, 2));
    let newPhi = 1 / Math.sqrt((1/Math.pow(prePhi,2)) + (1/vtotal));
    let newMu = player.mu + Math.pow(newPhi, 2) * (preDelta);
    let newRD = 173.7178 * newPhi;
    let newRating = 173.7178 * newMu + 1500;

    return {
        rating: Number.parseFloat(newRating),
        rd: Number.parseFloat(newRD),
        volatility: Number.parseFloat(newVolatility)
    }

}
module.exports = Glicko;