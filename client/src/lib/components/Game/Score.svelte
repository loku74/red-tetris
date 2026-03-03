<script lang="ts">
  let {
    score
  }: {
    score: number;
  } = $props();
</script>

<div class="absolute -top-12 right-1/2 translate-x-1/2 text-xl w-fit">
  Score: {score}
</div>
