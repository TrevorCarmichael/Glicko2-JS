const ratingToMu = (rating) => (rating - 1500)/173.7178;
const rdToPhi = (rd) => rd/173.7178;

function Glicko(tau){
    if(tau===undefined)
        this.tau = 0.5; 
    else
        this.tau = tau;
}



Glicko.prototype.formatPlayer = function addPlayer(name, rating, rd, volatility){
    return {
        name: name, 
        rating: rating,
        rd: rd,
        volatility: volatility,
        mu: ratingToMu(rating),
        phi: rdToPhi(rd)
    };
}

Glicko.prototype.calculateRankings = function calculateRankings(players, matches) {

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

    players.forEach((player) => {
        let vtotal = 0;
        let deltaTotal = 0;

        matches.filter(x => (x[0] === player.name) || (x[1] === player.name)).forEach((match) => {
            let findPlayer = (name) => players.find((p) => p.name === name);
            let result = (match[2]) ? match[2] : ((player.name) === match[0] ? 1 : 0);
            let opponent = (player.name === match[0]) ? findPlayer(match[1]) : findPlayer(match[0]);
            
            vtotal += v(player.mu, opponent.mu, opponent.phi);
            deltaTotal += delta(player.mu, opponent.mu, opponent.phi, result);

        });
    
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
        
    });

    return newPlayers;
}

Glicko.prototype.calculateInactiveUsers = function calculateInactive(players) {
    let newPhi = (player) => Math.sqrt(Math.pow(player.phi, 2) + Math.pow(player.volatility, 2));
    let newRD = (phi) => 173.7178 * phi;
    let newPlayers = [];

    players.forEach((player) => {
        let phi = newPhi(player);
        let rd = newRD(phi);

        newPlayers.push({
            name: player.name,
            rating: player.rating,
            rd: Number.parseFloat(rd),
            volatility: player.volatility,
            mu: player.me,
            phi: phi/173.7178
        });

    });
    
    return newPlayers;
}

module.exports = Glicko;