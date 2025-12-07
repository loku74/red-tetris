<script lang="ts">
  let {
    value = $bindable(""),
    maxlength,
    placeholder = "",
    error = undefined
  }: {
    value: string;
    maxlength: number;
    placeholder?: string;
    error?: string;
  } = $props();

  let isFocused = $state(false);
</script>

<div class="w-xs">
  <div class="relative">
    <input
      bind:value
      onfocus={() => (isFocused = true)}
      onblur={() => (isFocused = false)}
      class="w-full outline-red-primary focus:outline-2 py-2 px-4 pr-16 border-border border bg-dark-secondary {error
        ? 'border-red-400'
        : ''}"
      {maxlength}
      type="text"
      {placeholder}
    />
    {#if isFocused}
      <span
        class="absolute right-4 top-1/2 -translate-y-1/2 text-sm {value.length >= maxlength
          ? 'text-red-400'
          : 'text-white/50'}"
      >
        {value.length}/{maxlength}
      </span>
    {/if}
  </div>
  {#if error}
    <p class="text-red-400 text-sm mt-1">{error}</p>
  {/if}
</div>
