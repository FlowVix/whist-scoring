import { arrFrom, rotArray } from "./util";

const roundCountGen = (playerCount: number): number[] => {
    let counts = [];
    counts.push(...arrFrom(playerCount, (_) => 1));
    counts.push(...arrFrom(6, (i) => i + 2));
    counts.push(...arrFrom(playerCount, (_) => 8));
    counts.push(...arrFrom(6, (i) => 8 - i - 1));
    counts.push(...arrFrom(playerCount, (_) => 1));
    return counts;
};

const ROUND_CARD_COUNTS: Record<number, number[]> = {
    2: roundCountGen(2),
    3: roundCountGen(3),
    4: roundCountGen(4),
    5: roundCountGen(5),
    6: roundCountGen(6),
};
export const cardCounts = (playerCount: number): number[] =>
    ROUND_CARD_COUNTS[playerCount];

export type Round = { bid: number; taken: number }[];

export type Game = {
    players: string[];
    startingPlayer: number;

    rounds: Round[];
};

export const newGame = (
    players: string[],
    startingPlayer: number,
): [Game, number[]] => {
    let cardCount = cardCounts(players.length);
    return [{
        players,
        startingPlayer,
        rounds: cardCount.map((_) =>
            players.map((_) => ({ bid: 0, taken: 0 }))
        ),
    }, cardCount];
};

export type RoundDetails = {
    readonly disallowed: number;
    readonly incorrectLastBid: boolean;

    readonly takenTotal: number;
    readonly invalidTakenTotal: boolean;

    readonly outOfBounds: boolean;
};

export const roundDetails = (round: Round, cardCount: number): RoundDetails => {
    let outOfBounds = round.some((v) =>
        v.bid > cardCount || v.taken > cardCount || v.bid < 0 || v.taken < 0
    );

    let disallowed = cardCount;
    for (let i = 0; i < round.length - 1; i++) {
        disallowed -= round[i].bid;
    }
    let incorrectLastBid = round[round.length - 1].bid == disallowed;
    let takenTotal = 0;
    for (let i of round) {
        takenTotal += i.taken;
    }
    return {
        disallowed,
        incorrectLastBid,
        takenTotal,
        invalidTakenTotal: takenTotal != cardCount,
        outOfBounds,
    };
};
export const isValidRound = (details: RoundDetails): boolean => {
    return !(
        details.incorrectLastBid ||
        details.invalidTakenTotal ||
        details.outOfBounds
    );
};

export const calculateScores = (game: Game): [number[], number | null] => {
    let scores: Record<string, number> = {};
    for (let i of game.players) {
        scores[i] = 0;
    }

    let cardCount = cardCounts(game.players.length);
    for (let i = 0; i < game.rounds.length; i++) {
        let round = game.rounds[i];

        let valid = isValidRound(roundDetails(round, cardCount[i]));
        if (!valid) {
            return [game.players.map((v) => scores[v]), i];
        }

        let playersShift = rotArray(game.players, i + game.startingPlayer);
        for (let i = 0; i < playersShift.length; i++) {
            let player = playersShift[i];
            let bid = round[i].bid;
            let taken = round[i].taken;
            if (taken == bid) {
                scores[player] += taken * 10 + 50;
            } else {
                scores[player] -= Math.abs(taken - bid) * 10;
            }
        }
    }
    return [game.players.map((v) => scores[v]), null];
};
