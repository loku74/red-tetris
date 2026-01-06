<script lang="ts">
  let {
    value = $bindable(""),
    input = $bindable(),
    maxlength,
    placeholder = "",
    error = undefined,
    border = true,
    fontSize = "",
    fill = false,
    outline = true,
    onEnter = () => {}
  }: {
    value: string;
    input?: HTMLInputElement;
    maxlength: number;
    placeholder?: string;
    error?: string;
    border?: boolean;
    fontSize?: string;
    fill?: boolean;
    outline?: boolean;
    onEnter?: () => void;
  } = $props();

  let isFocused = $state(false);
</script>

<div class="w-xs {fill ? 'h-full w-full' : ''}">
  <div class="relative {fill ? 'h-full w-full' : ''}">
    <input
      onkeydown={(e) => {
        if (e.key === "Enter") {
          onEnter();
        }
      }}
      bind:this={input}
      bind:value
      onfocus={() => (isFocused = true)}
      onblur={() => (isFocused = false)}
      class="w-full outline-red-primary py-2 pl-4 pr-18 bg-dark-secondary
      {outline ? `focus:outline-2` : 'outline-none'}
      {fill ? 'h-full w-full' : ''}
      {error ? 'border-red-400' : ''}
      {border ? 'border border-border' : ''}
      {fontSize ? `text-${fontSize}` : 'text-md'}"
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
