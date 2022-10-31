<script lang="ts" setup>
const { data } = await useFetch("/api/session", {
  headers: useRequestHeaders(["cookie"]),
});

function logout() {
  fetch("/api/logout").then(() => {
    window.location.href = "/login";
  });
}
</script>

<template>
  <div
    class="h-screen w-screen fixed top-0 left-0 grid grid-rows-[auto_minmax(0,1fr)] bg-base-300"
  >
    <div
      class="flex items-center justify-between p-4 gap-8 sticky top-0 bg-base-100"
    >
      <div class="flex gap-8 items-center" id="menu-portal" />

      <div class="flex gap-4 items-center" v-if="data?.session">
        <span class="text-sm">
          {{ data.session.user.email }}
        </span>

        <button @click="logout" class="btn btn-sm">logout</button>
      </div>

      <div class="flex gap-4" v-else>
        <a href="/signup" class="btn btn-sm btn-primary">sign up</a>
        <a href="/login" class="btn btn-sm">sign in</a>
      </div>
    </div>

    <slot />
  </div>
</template>
