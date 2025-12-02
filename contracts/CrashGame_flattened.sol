
// File: @openzeppelin/contracts/security/ReentrancyGuard.sol


// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: CrashGame.sol


pragma solidity ^0.8.24;


interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns (uint8);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);

    function allowance(address owner, address spender) external view returns (uint256);
}
interface IGGWDeposit {
    struct Game {
        uint256 gameId;
        string gameCode;
        bytes32 gameCodeHash;
        address gameAddress;
        uint256 bankAmount;
        uint256 pendingBankAmount;
        uint256 burnPercent;        // pt 100 = 100%
        uint256 stakePercent;       // burnPercent+stakePercent = 100
        string description;
    }
    function getUserDeposit(address userAddress) external view returns (uint256);
    function gameBurnAndStake(uint256 fromAmount) external;
    function gameWithdrawUserDeposit(address userAddress, uint256 amount) external;
    function gameDepositUserDeposit(address userAddress, uint256 amount) external;
    function getGame(address gameAddress) external view returns (Game memory); 
}
contract GGWorldCrashGame is ReentrancyGuard {
    IERC20 public token;
    IGGWDeposit public depositManager;

    uint256 public constant PRECISION = 1e18;

    uint256 public minMultiplier = 1100000000000000000;
    uint256 public maxMultiplier = 7000000000000000000;

    uint256 public roundCoolDown = 60;

    struct Player {
        address playerAddress;
        uint256 playerId;
        uint256 betsAmount;
        uint256 cashOutAmount;
        uint256 roundsCount;
        uint256 currentRoundId;
    }

    address public                                  oracle;
    address public                                  owner;

    uint256 public                                  totalBets = 0;
    uint256 public                                  totalCashOut = 0;
    uint256 public                                  totalBetsAmount = 0;
    uint256 public                                  totalCashOutAmount = 0;

    mapping(address => Player) public               players;
    uint256 public                                  playersCount = 0;
    mapping(address => bool) public                 playerExists;
    /* PlayerID => PlayerAddress */
    mapping(uint256 => address) public              playersList;
    mapping(uint256 => mapping(uint256 => uint256)) 
        public                                      playersRounds;

    enum ROUND_STATE {
        NONE,       // Not exists
        OPENING,    // Opened for bets
        PENDING,    // Pending - rigster players in round
        RUN,        // Running
        CLOSED,     // Closed
        CANCELED    // Cancelled 
    }
    struct Round {
        uint256 roundId;
        ROUND_STATE state;
        uint256 startsIn;
        uint256 endsIn;
        uint256 playersCount;
        uint256 cashOutCount;
        uint256 betsAmount;
        uint256 cashOutAmount;
        uint256 multiplier;
        bytes32 multiplierHash;
        bytes32 multiplierSalt;
    }

    struct RoundPlayer {
        address playerAddress;
        uint256 betAmount;
    }
    struct CashOutPlayer {
        address playerAddress;
        uint256 multiplier;
    }

    uint256 public minBet = 1 ether;
    uint256 public maxBet = 100 ether;

    uint256 public                                                  roundsCounter = 0;
    mapping (uint256 => Round) public                               rounds;
    // roundId => { index => RoundPlayer }
    mapping (uint256 => mapping (uint256 => RoundPlayer)) public    roundPlayers;
    // roundId => { playerId => index }
    mapping (uint256 => mapping (uint256 => uint256)) public        roundPlayersIds;
    // roundId => { playerId => exists } 
    mapping (uint256 => mapping (uint256 => bool)) public           roundPlayersExists;
    // roundId => { index => CashOutPlayer }
    mapping (uint256 => mapping (uint256 => CashOutPlayer)) public  roundPlayersCashOut;
    // roundId => { playerId => index }
    mapping (uint256 => mapping (uint256 => uint256)) public        roundPlayersCashOutIds;
    // roundId => { playerId => bool }
    mapping (uint256 => mapping (uint256 => bool)) public           roundPlayersCashOutClaimed;

    mapping(bytes32 => bool) public usedHashes;

    // Add player to round
    event RoundEntering(uint256 roundId, RoundPlayer[] players);
    function enterToRound(uint256 roundId, RoundPlayer[] memory _players) public onlyOracle nonReentrant {
        require(rounds[roundId].state == ROUND_STATE.PENDING, "Not pending round");

        uint256 betsAmount = 0;
        uint256 playersInRoundCount = rounds[roundId].playersCount;
        for (uint256 i = 0; i < _players.length; i++) {
            registerPlayer(_players[i].playerAddress);
            Player storage player = players[
                _players[i].playerAddress
            ];
            uint256 playerDepositAmount = depositManager.getUserDeposit(_players[i].playerAddress);

            if((playerDepositAmount >= _players[i].betAmount)
                && !roundPlayersExists[roundId][player.playerId]
                && _players[i].betAmount >= minBet
                && _players[i].betAmount <= maxBet
            ){

                depositManager.gameWithdrawUserDeposit(_players[i].playerAddress, _players[i].betAmount);
                player.betsAmount += _players[i].betAmount;
                player.currentRoundId = roundId;
                playersRounds[player.playerId][player.roundsCount] = roundId;
                player.roundsCount++;
                roundPlayers[roundId][playersInRoundCount] = _players[i];
                roundPlayersExists[roundId][player.playerId] = true;
                playersInRoundCount++;
                betsAmount += _players[i].betAmount;

                totalBets++;
            }
        }

        totalBetsAmount += betsAmount;
        rounds[roundId].betsAmount += betsAmount;
        rounds[roundId].playersCount = playersInRoundCount;

        emit RoundEntering(roundId, _players);
    }

    event RoundPending(uint256 roundId, bytes32 multiplierHash);
    function pendingRound(
        bytes32 multiplierHash
    ) public onlyOracle nonReentrant {
        require(
            rounds[roundsCounter].state == ROUND_STATE.NONE
            || rounds[roundsCounter].state == ROUND_STATE.CLOSED
            || rounds[roundsCounter].state == ROUND_STATE.CANCELED,
            "Prev round not closed"
        );
        require(!usedHashes[multiplierHash], "Hash already used");
        usedHashes[multiplierHash] = true;

        roundsCounter++;
        uint256 roundId = roundsCounter;

        Round storage round = rounds[roundId];
        rounds[roundId] = Round({
            roundId:            roundId,
            state:              ROUND_STATE.PENDING,
            startsIn:           block.timestamp,
            endsIn:             0,
            playersCount:       round.playersCount,
            cashOutCount:       0,
            betsAmount:         round.betsAmount,
            cashOutAmount:      0,
            multiplier:         0,
            multiplierHash:     multiplierHash,
            multiplierSalt:     bytes32(0)
        });
        rounds[roundId + 1].state = ROUND_STATE.OPENING;

        emit RoundPending(roundId, multiplierHash);
    }

    event RoundStarted(uint256 roundId, uint256 playersCount, uint256 betsAmount);
    function startRound(uint256 roundId) public onlyOracle nonReentrant {
        require(rounds[roundId].state == ROUND_STATE.PENDING, "Not pending");

        rounds[roundId].state = ROUND_STATE.RUN;
        rounds[roundId].startsIn = block.timestamp;

        emit RoundStarted(roundId, rounds[roundId].playersCount, rounds[roundId].betsAmount);
    }

    function checkHash(
        uint256 multiplier,
        bytes32 multiplierHash,
        bytes32 multiplierSalt
    ) public pure returns (bool) {
        bytes32 calculatedHash = keccak256(abi.encodePacked(multiplier, multiplierSalt));
        return calculatedHash == multiplierHash;
    }

    event RoundCanceled(uint256 roundId);
    function cancelRound(
        uint256 roundId
    ) public nonReentrant {
        require(msg.sender == owner || msg.sender == oracle, "Only owner or oracle");
        require(rounds[roundId].state == ROUND_STATE.PENDING || rounds[roundId].state == ROUND_STATE.RUN, "Not pending or run");

        rounds[roundId].state = ROUND_STATE.CANCELED;
        rounds[roundId].endsIn = block.timestamp;

        for (uint256 i = 0; i < rounds[roundId].playersCount; i++) {
            depositManager.gameDepositUserDeposit(roundPlayers[roundId][i].playerAddress, roundPlayers[roundId][i].betAmount);
            players[roundPlayers[roundId][i].playerAddress].betsAmount -= roundPlayers[roundId][i].betAmount;
        }

        emit RoundCanceled(roundId);
    }

    event RoundFinished(
        uint256 roundId,
        uint256 multiplier,
        bytes32 multiplierSalt,
        bytes32 multiplierHash,
        uint256 playerCount,
        uint256 betsAmount,
        uint256 cashOutAmount
    );
    function finishRound(
        uint256 roundId,
        uint256 multiplier,
        bytes32 multiplierSalt,
        CashOutPlayer[] memory cashOutPlayers
    ) public onlyOracle nonReentrant {
        require(rounds[roundId].state == ROUND_STATE.RUN, "Not runned");
        require(
            checkHash(multiplier, rounds[roundId].multiplierHash, multiplierSalt),
            "Not valid multiplier"
        );
        Round storage round = rounds[roundId];
        round.multiplier = multiplier;
        round.multiplierSalt = multiplierSalt;
        round.state = ROUND_STATE.CLOSED;
        round.endsIn = block.timestamp;

        uint256 cashOutAmount = 0;
        uint256 cashOutFromBets = 0;
        uint256 cashOutInRoundCount = 0;

        
        for (uint256 i = 0; i < cashOutPlayers.length; i++) {
           
            Player storage player = players[cashOutPlayers[i].playerAddress];
             uint256 playerId = player.playerId;
            if (roundPlayersExists[roundId][playerId]
                && !roundPlayersCashOutClaimed[roundId][playerId]) {

                cashOutFromBets += roundPlayers[roundId][
                    roundPlayersIds[roundId][playerId]
                ].betAmount;
                RoundPlayer memory betInfo = roundPlayers[roundId][
                    roundPlayersIds[roundId][playerId]
                ];
                uint256 wonAmount = (betInfo.betAmount * cashOutPlayers[i].multiplier) / PRECISION;

                cashOutAmount += wonAmount;
                player.cashOutAmount += wonAmount;
                
                depositManager.gameDepositUserDeposit(player.playerAddress, wonAmount);

                roundPlayersCashOutClaimed[roundId][playerId] = true;
                roundPlayersCashOut[roundId][cashOutInRoundCount] = cashOutPlayers[i];
                roundPlayersCashOutIds[roundId][playerId] = cashOutInRoundCount;

                cashOutInRoundCount++;
            }
        }
        
        totalCashOut += cashOutInRoundCount;
        totalCashOutAmount += cashOutAmount;

        round.cashOutAmount = cashOutAmount;
        round.cashOutCount = cashOutInRoundCount;

        uint256 lostAmount = round.betsAmount - cashOutFromBets;
        if (lostAmount > 0) {
            depositManager.gameBurnAndStake(lostAmount);
        }

        emit RoundFinished(
            roundId,
            multiplier,
            multiplierSalt,
            round.multiplierHash,
            round.playersCount,
            round.betsAmount,
            cashOutAmount
        );
    }

    function getCurrentRoundState() public view returns (ROUND_STATE) {
        return rounds[roundsCounter].state;
    }
    function getCurrentRound() public view returns (uint256) {
        return roundsCounter;
    }
    function getNextRound() public view returns (uint256) {
        return roundsCounter + 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }

    constructor(address _tokenAddress, address _depositManager) {
        token = IERC20(_tokenAddress);
        
        rounds[0].state = ROUND_STATE.CLOSED;
        rounds[1].state = ROUND_STATE.OPENING;

        oracle = msg.sender;
        depositManager = IGGWDeposit(_depositManager);
        owner = msg.sender;
    }

    function registerPlayer(address playerAddress) internal {
        if (!playerExists[playerAddress]) {
            playersCount++;
            uint256 playerId = playersCount;

            players[playerAddress] = Player({
                playerAddress: playerAddress,
                playerId: playerId,
                betsAmount: 0,
                cashOutAmount: 0,
                roundsCount: 0,
                currentRoundId: 0
            });
            playersList[playerId] = playerAddress;
            playerExists[playerAddress] = true;
        }
    }

    struct GameTokenInfo {
        address tokenAddress;
        uint8 decimals;
        string name;
        string symbol;
        uint256 balance;
        uint256 allowance;
    }

    function getTokenInfo(address playerAddress) public view returns (GameTokenInfo memory) {
        return GameTokenInfo({
            tokenAddress: address(token),
            decimals: token.decimals(),
            name: token.name(),
            symbol: token.symbol(),
            balance: (playerAddress != address(0)) ? token.balanceOf(playerAddress) : 0,
            allowance: (playerAddress != address(0)) ? token.allowance(playerAddress, address(depositManager)) : 0
        });
    }
    function setMinBet(uint256 amount) public onlyOwner {
        minBet = amount;
    }
    function setMaxBet(uint256 amount) public onlyOwner {
        maxBet = amount;
    }
    function setOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }
    function setDepositManager(address newDepositManager) public onlyOwner {
        depositManager = IGGWDeposit(newDepositManager);
    }
    function transferOwnership(address newOwner) public onlyOwner {         
        owner = newOwner;
    }
    function setMinMultiplier(uint256 newValue) public onlyOwner {
        minMultiplier = newValue;
    }
    function setMaxMultiplier(uint256 newValue) public onlyOwner {
        maxMultiplier = newValue;
    }
    function setRoundCoolDown(uint256 newValue) public onlyOwner {
        roundCoolDown = newValue;
    }

    function getPlayerRounds(address playerAddress, uint256 offset, uint256 limit) public view returns (
        Round[] memory ret,
        uint256[] memory bets,
        uint256[] memory cashouts,
        uint256[] memory multipliers
    ) {
        Player memory player = players[playerAddress];
        if (player.playerAddress == playerAddress) {
            if (offset > player.roundsCount) return (
                new Round[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0)
            );

            if (offset == 0 && limit == 0) {
                limit = player.roundsCount;
            }
            if ((offset + limit) > player.roundsCount) {
                limit = player.roundsCount - offset;
            }

            ret = new Round[](limit);
            bets = new uint256[](limit);
            cashouts = new uint256[](limit);
            multipliers = new uint256[](limit);

            for (uint256 i = 0; i < limit; i++) {
                uint256 roundId = playersRounds[player.playerId][ player.roundsCount - i - offset - 1];

                Round memory round = rounds[roundId];
                RoundPlayer memory betInfo = roundPlayers[roundId][
                    roundPlayersIds[roundId][player.playerId]
                ];
                ret[i] = round;
                bets[i] = betInfo.betAmount;
                if (roundPlayersCashOutClaimed[roundId][player.playerId]) {
                    CashOutPlayer memory cashoutInfo = roundPlayersCashOut[roundId][
                        roundPlayersCashOutIds[roundId][player.playerId]
                    ];
                    cashouts[i] = (betInfo.betAmount * cashoutInfo.multiplier) / PRECISION;
                    multipliers[i] = cashoutInfo.multiplier;
                }
            }
            return (
                ret,
                bets,
                cashouts,
                multipliers
            );
        }
        return (
            new Round[](0),
            new uint256[](0),
            new uint256[](0),
            new uint256[](0)
        );
    }
    function getRounds(uint256 offset, uint256 limit) public view returns (Round[] memory) {
        if (offset > roundsCounter) return new Round[](0);
        if (offset == 0 && limit == 0) {
            limit = roundsCounter;
        }
        if ((offset + limit) > roundsCounter) {
            limit = roundsCounter - offset;
        }
        Round[] memory ret = new Round[](limit);
        for (uint256 i = 0; i < limit; i++) {
            ret[i] = rounds[roundsCounter - i - offset];
        }
        return ret;
    }
    function getPlayers(uint256 offset, uint256 limit) public view returns (Player[] memory) {
        if (offset > playersCount) return new Player[](0);
        if (offset == 0 && limit == 0) {
            limit = playersCount;
        }
        
        if ((offset + limit) > playersCount) {
            limit = playersCount - offset;
        }
        Player[] memory ret = new Player[](limit);
        for (uint256 i = 0; i < limit; i++) {
            ret[i] = players[playersList[ playersCount - i - offset]];
        }
        return ret;
    }
    function getRoundPlayers(uint256 roundId, uint256 offset, uint256 limit)
    public view returns (
        Player[] memory ret,
        uint256[] memory bets,
        uint256[] memory multipliers,
        uint256[] memory cashoutAmounts
    ) {
        if (offset > rounds[roundId].playersCount) return  (new Player[](0), new uint256[](0), new uint256[](0), new uint256[](0));

        if (offset == 0 && limit == 0) {
            limit = rounds[roundId].playersCount;
        }
        if ((offset + limit) > rounds[roundId].playersCount) {
            limit = rounds[roundId].playersCount - offset;
        }
        ret = new Player[](limit);
        bets = new uint256[](limit);
        cashoutAmounts = new uint256[](limit);
        for (uint256 i = 0; i < limit; i++) {
            uint256 index = rounds[roundId].playersCount - i - offset - 1;
            Player memory player = players[
                roundPlayers[roundId][
                    index
                ].playerAddress
            ];
            ret[i] = player;
            bets[i] = roundPlayers[roundId][index].betAmount;
            if (roundPlayersCashOutClaimed[roundId][player.playerId]) {
                multipliers[i] = roundPlayersCashOut[roundId][
                    roundPlayersCashOutIds[roundId][player.playerId]
                ].multiplier;
                cashoutAmounts[i] = (
                    roundPlayers[roundId][index].betAmount
                    *
                    roundPlayersCashOut[roundId][
                        roundPlayersCashOutIds[roundId][player.playerId]
                    ].multiplier
                ) / PRECISION;
            }
        }
        return (
            ret,
            bets,
            multipliers,
            cashoutAmounts
        );
    }
    function gameBank() public view returns (uint256) {
        IGGWDeposit.Game memory game = depositManager.getGame(address(this));
        return game.bankAmount;
    }
    function getUserDeposit(address playerAddress) public view returns (uint256) {
        return depositManager.getUserDeposit(playerAddress);
    }
    function recoverWrongToken(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(token), "Cant recower game token. Only bank withdraw");
        IERC20(tokenAddress).transfer(owner, amount);
    }
}