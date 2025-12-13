<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  // socket
  import { getRoom, getSocket } from "$lib/socket";

  // types
  import type { SocketJoinRoomError, SocketJoinRoomResponse } from "$lib/types/socket";
  import { USERNAME_MAX_LENGTH } from "$lib/constants";

  const room = page.params.room;
  const username = page.params.player;

  let roomError = $state<string | undefined>(undefined);
  let userError = $state<string | undefined>(undefined);
  let unusualError = $state<string | undefined>(undefined);
  let joined = $state(false);

  const socket = getSocket();

  let errors = $derived([roomError, userError, unusualError].filter((e) => e));

  function joinRoom() {
    if (joined) return;

    localStorage.setItem("username", username?.substring(0, USERNAME_MAX_LENGTH)!);
    socket.emit(
      "join room",
      { username, room },
      (err: SocketJoinRoomError, response: SocketJoinRoomResponse) => {
        if (err) {
          roomError = err.room;
          userError = err.username;
          if (!userError && !roomError) {
            unusualError = "Failed to join room";
          }
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

<div class="flex h-screen items-center justify-center bg-dark-primary gap-32">
  {#if !joined}
    <div class="bg-dark-secondary px-8 py-4 ring-border ring">
      <div class="text-center">
        {#each errors as error}
          {#if error}
            <p class="text-red-400 text-xl mb-2">{error}</p>
          {/if}
        {:else}
          <p class="text-white text-xl">Joining room "{room}" as "{username}"...</p>
        {/each}
      </div>
    </div>
  {:else}
    <div
      class="p-4 text-center bg-dark-secondary ring ring-inset ring-border h-[640px] w-[320px] flex flex-col"
    >
      <h1 class="text-red-primary text-2xl text-ellipsis overflow-hidden">{room}</h1>
    </div>
    <div class="bg-dark-secondary ring ring-inset ring-border flex h-[640px] w-[320px]"></div>
  {/if}
</div>
