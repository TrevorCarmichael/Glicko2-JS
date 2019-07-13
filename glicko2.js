let g = (phi) => 1 / Math.sqrt(1 + 3 * Math.pow(phi, 2) / Math.pow(Math.PI, 2));
let E = (mu, muj, phi) => 1 / (1 + Math.exp(-1 * g(phi) * (mu - muj)));
let v = (mu, muj, phi) => Math.pow(g(phi),2) * E(mu, muj, phi) * (1 - E(mu, muj, phi));
let delta = (mu, muj, phi, score) => g(phi) * (score - E(mu, muj, phi));
let a = (vol) => Math.log(Math.pow(vol, 2));
let f_base = (delta, phi, v, a, tau) => (x) => (
    (Math.pow(Math.E, x) * (Math.pow(delta, 2) - Math.pow(phi, 2) - v - Math.pow(Math.E, x)))/
    (2 * Math.pow((Math.pow(phi, 2) + v + Math.pow(Math.E, x)),2))) - ( (x-a) / Math.pow(tau,2) ); //what

let epsilon = 0.000001;

let convert = (rating, rd) => { 
    return {
        mu: (rating - 1500)/173.7178, 
        phi: (rd/173.7178)
    } 
};

function calculateRankings (player, matches, tau = 0.5) {

        //Step 2
        playerValues = convert(player.rating, player.rd);
        playerValues.volatility = player.volatility;
        opponentValues = matches.map((x) =>{
            let computed = convert(x[0], x[1]);
            computed.result = x[2];
            return computed;
        });

        //Step 3
        let vTotal = 1 / opponentValues.map((opponent) => v(playerValues.mu, opponent.mu, opponent.phi)).reduce((acc, opp) => acc + opp);
        
        //Step 4
        let preDelta = opponentValues.map((opponent) => delta(playerValues.mu, opponent.mu, opponent.phi, opponent.result)).reduce((acc, opp) => acc + opp);
        let deltaTotal = vTotal * preDelta;

        //Step 5
        let f = f_base(deltaTotal, playerValues.phi, vTotal, a(playerValues.volatility), tau);
        let A = a(playerValues.volatility);
        let B;
        if(Math.pow(deltaTotal, 2) > (Math.pow(playerValues.phi, 2) + v)) {
            B = Math.log(Math.pow(deltaTotal, 2) - Math.pow(playerValues.phi, 2) - vTotal);
        } else {
            let k = 1;
            while(f(a(playerValues.volatility) - k * tau) < 0){
                k +=1;
            }
            B = a(playerValues.volatility) - (k * tau);
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

        let newVolatility = Math.pow(Math.E, A / 2);

        //Step 6
        let prePhi = Math.sqrt(Math.pow(playerValues.phi, 2) + Math.pow(newVolatility, 2));
        console.log(prePhi);

        //Step 7
        let newPhi = 1 / Math.sqrt((1/Math.pow(prePhi,2)) + (1/vTotal));
        let newMu = playerValues.mu + Math.pow(newPhi, 2) * (preDelta);
        
        //Step 8
        let newRating = 173.7178 * newMu + 1500;
        let newRD = 173.7178 * newPhi;

        return {
            rating: newRating,
            rd: newRD,
            volatility: newVolatility
        };
}

module.exports = calculateRankings;