<script lang="ts">
  let {
    value = $bindable(""),
    input = $bindable(),
    focused = $bindable(false),
    maxlength,
    placeholder = "",
    error = undefined,
    border = true,
    fontSize = "",
    fill = false,
    outline = true,
    onEnter = () => {},
    bright = false,
    regex = undefined,
    label = ""
  }: {
    value: string;
    input?: HTMLInputElement;
    focused?: boolean;
    maxlength: number;
    placeholder?: string;
    error?: string;
    border?: boolean;
    fontSize?: string;
    fill?: boolean;
    outline?: boolean;
    onEnter?: () => void;
    bright?: boolean;
    regex?: RegExp;
    label?: string;
  } = $props();

  const format = function format(v: string) {
    if (regex !== undefined) {
      return v.replace(regex, "_");
    }
    return v;
  };
</script>

<div class={fill ? "h-full w-full" : "w-xs"}>
  {#if label}
    <span class="pl-2 pb-1 text-sm text-white/80">
      {label}
    </span>
  {/if}
  <div class="relative {fill ? 'h-full w-full' : ''}">
    <input
      onkeydown={(e) => {
        if (e.key === "Enter") {
          onEnter();
        }
      }}
      bind:this={input}
      bind:value
      oninput={() => (value = format(value))}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
      class="w-full outline-red-primary py-2 pl-4 pr-18
      {bright ? 'bg-dark-accent' : ' bg-dark-secondary'}
      {outline ? `focus:outline-2` : 'outline-none'}
      {fill ? 'h-full w-full' : ''}
      {error ? 'border-red-400' : ''}
      {border ? 'border border-border' : ''}
      {fontSize ? `text-${fontSize}` : 'text-md'}"
      {maxlength}
      type="text"
      {placeholder}
    />
    {#if focused}
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
