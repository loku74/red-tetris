<script lang="ts">
  import { onMount } from "svelte";
  import { ServerOff } from "@lucide/svelte";

  import { EVENT_ROOM_UPDATE, EVENT_USER_CONNECT, EVENT_USER_CONNECT_ERROR } from "@app/shared";

  import Dialog from "$lib/components/Dialog.svelte";

  import { setRoomData } from "$lib/state/room.svelte";

  import { getSocket } from "$lib/socket/socket.svelte";

  import "./layout.css";

  let { children } = $props();

  let isConnected = $state(false);
  let connectionError = $state<string | null>(null);
  let showError = $state(false);

  onMount(() => {
    const socket = getSocket();
    isConnected = socket.connected;

    const onConnect = () => {
      isConnected = true;
      connectionError = null;
      showError = false;
    };

    socket.on(EVENT_USER_CONNECT, onConnect);

    const onConnectError = () => {
      isConnected = false;
      connectionError = "Failed to connect to server";
      showError = true;
    };

    socket.on(EVENT_USER_CONNECT_ERROR, onConnectError);
    socket.on(EVENT_ROOM_UPDATE, setRoomData);

    return () => {
      socket.off(EVENT_USER_CONNECT, onConnect);
      socket.off(EVENT_USER_CONNECT_ERROR, onConnectError);
      socket.off(EVENT_ROOM_UPDATE, setRoomData);
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
  <link rel="icon" href="/favicon.jpg" />
  <title>Red Tetris</title>
  <meta
    name="description"
    content="Play Red Tetris for free with your friends. Chat, warm-up and play together with the settings you choose."
  />
  <script
    defer
    src="https://analytics.red-tetris.fr/script.js"
    data-website-id="568ff6d6-0ec7-4abe-b1bf-afa5179f4103"
  ></script>
</svelte:head>

{@render children()}

{#if !isConnected}
  <div
    class="fixed inset-0 z-9999 flex items-center justify-center bg-dark-primary pointer-events-auto"
    role="dialog"
    aria-modal="true"
    aria-label="Connecting to server"
  >
    <div class="bg-dark-secondary px-8 py-4 ring-border ring">
      {#if connectionError}
        <Dialog
          bind:open={showError}
          confirm="retry"
          confirmCallback={retry}
          title="Connection Error"
          icon={ServerOff}
        >
          {connectionError}
        </Dialog>
      {:else}
        <div class="text-center">Connecting...</div>
      {/if}
    </div>
  </div>
{/if}
