<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  // socket
  import { getRoom, getSocket } from "$lib/socket";

  // types
  import type { SocketJoinRoomError, SocketJoinRoomResponse } from "$lib/types/socket";

  const room = page.params.room;
  const username = page.params.player;

  let error = $state<string | undefined>(undefined);
  let joined = $state(false);

  const socket = getSocket();

  function joinRoom() {
    if (joined) return;

    localStorage.setItem("username", username!);
    socket.emit(
      "join room",
      { username, room },
      (err: SocketJoinRoomError, response: SocketJoinRoomResponse) => {
        if (err) {
          error = err.username ?? err.room ?? "Failed to join room";
          setTimeout(() => {
            goto("/");
          }, 3000);
        } else if (response.success) {
          joined = true;
        }
      }
    );
  }

  onMount(() => {
    if (socket.connected) {
      if (!getRoom()) joinRoom();
      else joined = true;
    } else socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  });
</script>

<div class="flex h-screen items-center justify-center bg-dark-primary">
  <div class="bg-dark-secondary px-8 py-4 ring-border ring">
    {#if error}
      <div class="text-center">
        <p class="text-red-400 text-xl mb-2">{error}</p>
        <p class="text-white/50">Redirecting to home...</p>
      </div>
    {:else if !joined}
      <p class="text-white text-xl">Joining room "{room}" as "{username}"...</p>
    {/if}
  </div>
</div>
