<script lang="ts">
    import type { Game } from "$lib";
    import { cardCounts, newGame } from "$lib";
    import { X } from "lucide-svelte";
    import type { Snippet } from "svelte";

    let {
        children,
        onclick = () => {},
        small = false,
        active = false,
        disabled = false,
    }: {
        children?: Snippet;
        onclick?: () => void;
        small?: boolean;
        active?: boolean;
        disabled?: boolean;
    } = $props();
</script>

<button
    class="{active ? 'bg-bg4' : 'bg-bg2'} {active
        ? 'hover:bg-gray2'
        : 'hover:bg-bg3'} {active ? 'active:bg-bg3' : 'active:bg-bg1'} {small
        ? 'rounded-lg p-1'
        : 'border-2 border-fg1 rounded-xl p-2'} {disabled
        ? 'opacity-50 pointer-events-none'
        : ''}"
    onclick={() => onclick()}
    {disabled}>{@render children?.()}</button
>

<!-- <input type="number" bind:value={n} /><br />
<span class="text-white">{JSON.stringify(cardCounts(n), null, 4)}</span> -->
