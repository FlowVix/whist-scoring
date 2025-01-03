<script lang="ts">
    import type { Game } from "$lib";
    import {
        calculateScores,
        cardCounts,
        isValidRound,
        newGame,
        roundDetails,
    } from "$lib";
    import Button from "$lib/Button.svelte";
    import { clamp, rotArray } from "$lib/util";
    import {
        Bone,
        ChevronDown,
        ChevronRight,
        Crown,
        Play,
        Plus,
        TriangleAlert,
        X,
    } from "lucide-svelte";

    type MenuState =
        | { type: "No Game" }
        | { type: "Making"; players: string[]; startingPlayer: number }
        | {
              type: "In Progress";
              game: Game;
              cardCounts: number[];
              open: boolean[];
              viewingResults: boolean;
          };

    let zoomed = $state(false);
    $effect(() => {
        if (zoomed) {
            document.body.style.zoom = "60%";
        } else {
            document.body.style.zoom = "100%";
        }
    });
    let menuState: MenuState = $state({ type: "No Game" } as MenuState);

    // $effect(() => {
    //     if (state.type == "In Progress") {
    //         console.log(state.game);
    //     }
    // });
    $effect(() => {
        let snapshot = $state.snapshot(menuState);
        if (snapshot.type == "In Progress") {
            localStorage.setItem("savedGame", JSON.stringify(snapshot.game));
        }
    });
    // $inspect(menuState).with((_, s) => {
    //     if (s.type == "In Progress") {
    //         console.log("wrote to storage");
    //         localStorage.setItem("savedGame", JSON.stringify(s.game));
    //     }
    // });
</script>

<div
    style="width: {zoomed ? 100 / 0.6 : 100}vw; height: {zoomed
        ? 100 / 0.6
        : 100}vh"
>
    <div class="size-full bg-bg0 text-fg0 font-main font-medium flex flex-col">
        <div
            class="w-full min-h-16 bg-bg2 border-b-2 border-b-fg0 drop-shadow-xl font-title text-3xl flex justify-center items-center"
        >
            Whist Scoring
        </div>

        <div
            class="size-full min-h-0 flex flex-col justify-center items-center text-xl gap-4 p-4"
        >
            {#if menuState.type == "No Game"}
                {@const local = localStorage.getItem("savedGame")}

                <span class="text-2xl">No game in progress!</span>
                <Button
                    onclick={() => {
                        menuState = {
                            type: "Making",
                            players: ["", ""],
                            startingPlayer: 0,
                        };
                    }}
                >
                    Start new game
                </Button>
                {#if local != null}
                    <Button
                        onclick={() => {
                            let game: Game = JSON.parse(local);
                            menuState = {
                                type: "In Progress",
                                game,
                                cardCounts: cardCounts(game.players.length),
                                open: game.rounds.map(_ => false),
                                viewingResults: false,
                            };
                        }}
                    >
                        Load saved game
                    </Button>
                {/if}
                <button
                    class="text-fg4 opacity-50 text-sm"
                    onclick={() => (zoomed = !zoomed)}>change zoom</button
                >
            {:else if menuState.type == "Making"}
                <span class="text-2xl"
                    >Enter player names and select starting player</span
                >

                <div class="flex flex-col gap-2">
                    {#each menuState.players as name, idx}
                        <div class="flex items-center gap-2 text-xl">
                            <input
                                type="text"
                                class="bg-bgH border-2 border-fg1 rounded-xl p-2 text-center mr-2"
                                bind:value={menuState.players[idx]}
                            />
                            <!-- <button
                        class="text-red2 bg-bg2 hover:bg-bg3 active:bg-bg1 rounded-lg p-1"
                    >
                        <X size={36} strokeWidth={3} />
                    </button> -->
                            <Button
                                small
                                disabled={menuState.players.length == 2}
                                onclick={() => {
                                    if (menuState.type == "Making") {
                                        menuState.players.splice(idx, 1);
                                        menuState.startingPlayer = clamp(
                                            menuState.startingPlayer,
                                            0,
                                            menuState.players.length - 1
                                        );
                                    }
                                }}
                            >
                                <X
                                    size={32}
                                    strokeWidth={3}
                                    class="text-red2"
                                />
                            </Button>
                            <Button
                                small
                                active={idx == menuState.startingPlayer}
                                onclick={() => {
                                    if (menuState.type == "Making") {
                                        menuState.startingPlayer = idx;
                                    }
                                }}
                            >
                                <Play
                                    size={32}
                                    strokeWidth={3}
                                    class={idx == menuState.startingPlayer
                                        ? "text-fg0"
                                        : "text-fg0/70"}
                                />
                            </Button>
                        </div>
                    {/each}
                </div>

                <Button
                    small
                    disabled={menuState.players.length == 6}
                    onclick={() => {
                        if (menuState.type == "Making") {
                            menuState.players.push("");
                        }
                    }}
                >
                    <span
                        class="flex justify-center items-center mr-[6px] gap-1"
                        ><Plus size={32} strokeWidth={3} class="text-green2" /> Add
                        Player</span
                    >
                </Button>
                <span class="text-2xl"
                    ><Button
                        disabled={menuState.players.some(
                            v => v.trim().length == 0
                        )}
                        onclick={() => {
                            if (menuState.type == "Making") {
                                let [game, cardCounts] = newGame(
                                    menuState.players.map(v => v.trim()),
                                    menuState.startingPlayer
                                );
                                menuState = {
                                    type: "In Progress",
                                    game,
                                    cardCounts,
                                    open: game.rounds.map(_ => false),
                                    viewingResults: false,
                                };
                            }
                        }}>Start game</Button
                    ></span
                >
            {:else}
                <!--  -->
                <div class="size-full min-h-0 flex flex-col items-center gap-4">
                    <Button
                        onclick={() => {
                            if (menuState.type == "In Progress") {
                                menuState.viewingResults =
                                    !menuState.viewingResults;
                            }
                        }}
                        >{menuState.viewingResults
                            ? "Back to Game"
                            : "View Results"}</Button
                    >
                    {#if !menuState.viewingResults}
                        <div
                            class="bg-bg1 w-full h-full min-h-0 border-2 border-bg3 rounded-xl p-2 overflow-y-scroll flex flex-col gap-2"
                        >
                            {#each menuState.game.rounds as round, roundIdx}
                                {@const open = menuState.open[roundIdx]}
                                {@const cardCount =
                                    menuState.cardCounts[roundIdx]}
                                {@const details = roundDetails(
                                    round,
                                    cardCount
                                )}
                                {@const valid = isValidRound(details)}
                                {@const playerShift = rotArray(
                                    menuState.game.players,
                                    roundIdx + menuState.game.startingPlayer
                                )}

                                <div
                                    class="bg-bg border-2 {valid
                                        ? 'border-fg1'
                                        : 'border-fg1 border-x-red2 border-x-4'} rounded-xl flex flex-col"
                                >
                                    <button
                                        class="w-full h-full flex p-1"
                                        onclick={() => {
                                            if (
                                                menuState.type == "In Progress"
                                            ) {
                                                menuState.open[roundIdx] =
                                                    !open;
                                            }
                                        }}
                                    >
                                        {#if open}
                                            <ChevronDown
                                                size={36}
                                                strokeWidth={3}
                                            />
                                        {:else}
                                            <ChevronRight
                                                size={36}
                                                strokeWidth={3}
                                            />
                                        {/if}
                                        <div
                                            class="w-full h-full flex justify-center items-center gap-4"
                                        >
                                            <span class="w-full text-right"
                                                >Round {roundIdx + 1}</span
                                            >
                                            <span class="text-fg3">-</span>
                                            <span class="w-full text-left"
                                                >{cardCount}
                                                {cardCount == 1
                                                    ? "card"
                                                    : "cards"}</span
                                            >
                                        </div>
                                    </button>
                                    {#if open}
                                        <div class="p-2 flex flex-col gap-2">
                                            <span class="text-fg3"
                                                ><span class="font-bold italic"
                                                    >{playerShift[0]}</span
                                                > deals the cards.</span
                                            >
                                            <span class="text-fg3">
                                                {#if details.disallowed >= 0}
                                                    <span
                                                        class="font-bold italic"
                                                        >{playerShift[
                                                            playerShift.length -
                                                                1
                                                        ]}</span
                                                    >
                                                    is not allowed to bid
                                                    <span class="text-red2"
                                                        >{details.disallowed}</span
                                                    >.
                                                {:else}
                                                    <span
                                                        class="font-bold italic"
                                                        >{playerShift[
                                                            playerShift.length -
                                                                1
                                                        ]}</span
                                                    >
                                                    is allowed to bid
                                                    <span class="text-green2"
                                                        >anything</span
                                                    >.
                                                {/if}
                                            </span>
                                            <div class="flex flex-col gap-2">
                                                {#each playerShift as player, playerIdx}
                                                    <div
                                                        class="flex items-center gap-2 text-fg3"
                                                    >
                                                        <div
                                                            class="font-bold text-fg0 min-w-24"
                                                        >
                                                            {player}:
                                                        </div>
                                                        <span>bid</span>
                                                        <input
                                                            type="number"
                                                            class="bg-bgH border-2 text-fg0 border-fg1 rounded-xl p-1 text-center w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            min={0}
                                                            max={cardCount}
                                                            bind:value={menuState
                                                                .game.rounds[
                                                                roundIdx
                                                            ][playerIdx].bid}
                                                        />
                                                        <span> and took</span>
                                                        <input
                                                            type="number"
                                                            class="bg-bgH border-2 text-fg0 border-fg1 rounded-xl p-1 text-center w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            min={0}
                                                            max={cardCount}
                                                            bind:value={menuState
                                                                .game.rounds[
                                                                roundIdx
                                                            ][playerIdx].taken}
                                                        />
                                                    </div>
                                                {/each}
                                            </div>
                                            {#snippet alert(msg: string)}
                                                <div
                                                    class="flex gap-2 text-red2 items-center"
                                                >
                                                    <TriangleAlert
                                                        size={24}
                                                        strokeWidth={3}
                                                    />

                                                    <span>{msg}</span>
                                                </div>
                                            {/snippet}
                                            {#if details.incorrectLastBid}
                                                {@render alert(
                                                    "Incorrect last bid"
                                                )}
                                            {/if}
                                            {#if details.invalidTakenTotal}
                                                {@render alert(
                                                    "Incorrect taken total"
                                                )}
                                            {/if}
                                            {#if details.outOfBounds}
                                                {@render alert(
                                                    "Out of bounds values"
                                                )}
                                            {/if}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                            <div class="w-full min-h-[50%]"></div>
                        </div>
                    {:else}
                        {@const [scores, upTo] = calculateScores(
                            menuState.game
                        )}
                        <div
                            class="flex flex-col p-4 gap-4 size-full items-center justify-center"
                        >
                            {#if upTo != null}
                                <span class="text-xl text-fg3"
                                    >Results until invalid round {upTo +
                                        1}</span
                                >
                            {/if}
                            {#each menuState.game.players as player, idx}
                                <div
                                    class="w-full flex bg-bgH border-2 rounded-2xl p-4 text-2xl justify-center relative"
                                >
                                    <span class="w-1/3 text-left">{player}</span
                                    >
                                    <span class="w-1/3 text-center"
                                        >{scores[idx]}</span
                                    >
                                    <span
                                        class="w-1/3 flex items-center justify-end"
                                    >
                                        {#if scores[idx] == Math.max(...scores)}
                                            <Crown
                                                size={32}
                                                strokeWidth={3}
                                                class="text-yellow2"
                                            />
                                        {:else if scores[idx] == Math.min(...scores)}
                                            <Bone
                                                size={32}
                                                strokeWidth={3}
                                                class="text-gray"
                                            />
                                        {/if}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>

    <!-- <input type="number" bind:value={n} /><br />
<span class="text-white">{JSON.stringify(cardCounts(n), null, 4)}</span> -->
</div>
