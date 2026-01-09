<script lang="ts">
  import { onMount } from "svelte";
  import "./layout.css";

  // components
  import Dialog from "$lib/components/Dialog.svelte";

  // assets
  import redPiece from "$lib/assets/red_piece.jpg";

  // socket
  import { getSocket } from "$lib/socket/socket.svelte";
  import { ServerOff } from "@lucide/svelte";

  let { children } = $props();

  let isConnected = $state(false);
  let connectionError = $state<string | null>(null);
  let showError = $state(false);

  onMount(() => {
    const socket = getSocket();
    isConnected = socket.connected;

    socket.on("connect", () => {
      isConnected = true;
      connectionError = null;
      showError = false;
    });

    socket.on("connect_error", () => {
      isConnected = false;
      connectionError = "Failed to connect to server";
      showError = true;
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  });

  function retry() {
    const socket = getSocket();
    connectionError = null;
    showError = false;
    socket.connect();
  }
</script>

<svelte:head>
  <link rel="icon" href={redPiece} />
</svelte:head>

<Dialog
  bind:open={showError}
  confirm="retry"
  confirmCallback={retry}
  title="Connection Error"
  icon={ServerOff}
>
  {connectionError}
</Dialog>

{#if !isConnected}
  <div class="flex h-screen items-center justify-center bg-dark-primary">
    <div class="bg-dark-secondary px-8 py-4 ring-border ring">
      <div class="text-center">Connecting...</div>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
