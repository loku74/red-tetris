<script lang="ts">
  import { Check } from "@lucide/svelte";

  let { checked = $bindable(false), id }: { checked: boolean; id: string } = $props();
</script>

<button
  onclick={() => (checked = !checked)}
  {id}
  class="w-5 h-5 rounded-xs border duration-75 grid hover:brightness-125
  {checked ? 'border-red-accent' : ' border-border'}"
>
  {#if checked}
    <Check class="text-red-accent w-4 h-4 place-self-center pt-0.5" />
  {/if}
</button>
