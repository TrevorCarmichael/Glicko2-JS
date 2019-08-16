var should = require('chai').should();
var Glicko = require('../glicko2');
let ratings = new Glicko(1.2);

let players = [ratings.formatPlayer("One", 1500, 200, 0.06), 
            ratings.formatPlayer("Two", 1400, 30, 0.06), 
            ratings.formatPlayer("Three", 1550, 100, 0.06), 
            ratings.formatPlayer("Four", 1700, 300, 0.06), 
            ratings.formatPlayer("Five", 1500, 200, 0.5)];

let matches = [["One", "Two"],
            ["Three", "Two"],
            ["Four", "Two"],
            ["One", "Four"],
            ["One", "Two"],
            ["One", "Three"]];
            
describe('Glicko-2', function (){
    describe('#calculateRankings()', function (){
        it('should have length of 5 when given 5 users', function(){
            let newPlayers = ratings.calculateRankings(players, matches);
            newPlayers.should.have.lengthOf(5);
        });
        it('should return 1698 rating for player 1', function(){
            let newPlayers = ratings.calculateRankings(players, matches);
            newPlayers[0].rating.should.be.closeTo(1698.6285, 1);
        });
        it('should return 139.84 rd for player 1', function(){
            let newPlayers = ratings.calculateRankings(players, matches);
            newPlayers[0].rd.should.be.closeTo(139.8495, 0.01);
        });
        it('should return 0.06 volatility for player 1', function(){
            let newPlayers = ratings.calculateRankings(players, matches);
            newPlayers[0].volatility.should.be.closeTo(0.06, 0.0001);
        });
        it('should return 0.05999 for volatility based on values from the Glicko2 example', function(){
            let ratings2 = new Glicko(0.5);
            let players = [
                ratings2.formatPlayer("One", 1500, 200, 0.06), ratings2.formatPlayer("Two", 1400, 30, 0.06),
                ratings2.formatPlayer("Three", 1550, 100, 0.06), ratings2.formatPlayer("Four", 1700, 300, 0.06)
            
            ];
            let matches = [["One", "Two"],["Three", "One"],["Four", "One"]];
            let newPlayers = ratings2.calculateRankings(players, matches);
            newPlayers[0].volatility.should.be.closeTo(0.05999, 0.00001);
        });
        it('should return 1464.06 for rating based on values from the Glicko2 example', function(){
            let ratings2 = new Glicko(0.5);
            let players = [
                ratings2.formatPlayer("One", 1500, 200, 0.06), ratings2.formatPlayer("Two", 1400, 30, 0.06),
                ratings2.formatPlayer("Three", 1550, 100, 0.06), ratings2.formatPlayer("Four", 1700, 300, 0.06)
            
            ];
            let matches = [["One", "Two"],["Three", "One"],["Four", "One"]];
            let newPlayers = ratings2.calculateRankings(players, matches);
            newPlayers[0].rating.should.be.closeTo(1464.06, 0.01);
        });
        it('should return 151.52 for rd based on values from the Glicko2 example', function(){
            let ratings2 = new Glicko(0.5);
            let players = [
                ratings2.formatPlayer("One", 1500, 200, 0.06), ratings2.formatPlayer("Two", 1400, 30, 0.06),
                ratings2.formatPlayer("Three", 1550, 100, 0.06), ratings2.formatPlayer("Four", 1700, 300, 0.06)
            
            ];
            let matches = [["One", "Two"],["Three", "One"],["Four", "One"]];
            let newPlayers = ratings2.calculateRankings(players, matches);
            newPlayers[0].rd.should.be.closeTo(151.52, 0.01);
        });
    });

    describe('#calculateInactiveUsers()', function(){
        it('should return 200.2714 for an increased rd of inactive user with default values', function(){
            let player = [ratings.formatPlayer("One", 1500, 200, 0.06)];
            let newPlayers = ratings.calculateInactiveUsers(player);
            newPlayers[0].rd.should.be.closeTo(200.2714, 0.0001);
        });
    });

    describe('#formatPlayer()', function(){
        it('should return 1500 for default rating value if not given one', function(){
            let player = ratings.formatPlayer("One");
            let playerRating = player.rating;
            playerRating.should.equal(1500);
        });
        it('should return 200 for default rd value if not given one', function(){
            let player = ratings.formatPlayer("One");
            let playerRd = player.rd;
            playerRd.should.equal(200);
        });
        it('should return 0.06 for default volatility value if not given one', function(){
            let player = ratings.formatPlayer("One");
            let playerVolatility = player.volatility;
            playerVolatility.should.equal(0.06);
        });
        it('should return custom player object when given specified values', function(){
            let player = ratings.formatPlayer("TestPlayer", 1922, 133, 0.05);
            
            player.should.deep.equal({
                name: 'TestPlayer',
                rating: 1922,
                rd: 133,
                volatility: 0.05,
                mu: 2.429227171884516,
                phi: 0.7656095115181057
              });
        });
    });
});