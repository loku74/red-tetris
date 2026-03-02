<script lang="ts">
  import { Check } from "@lucide/svelte";

  let { checked = $bindable(false), id }: { checked: boolean; id: string } = $props();
</script>

<button
  onclick={() => (checked = !checked)}
  {id}
  class="w-5 h-5 rounded border duration-75 grid
  {checked ? 'border-red-accent/64' : 'border-border/64 hover:border-border'}"
>
  {#if checked}
    <Check class="text-red-accent w-4 h-4 place-self-center pt-0.5" />
  {/if}
</button>
