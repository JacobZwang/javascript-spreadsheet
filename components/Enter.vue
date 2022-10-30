<script lang="ts" setup>
import { ref } from "vue";
const email = ref("");
const password = ref("");

const props = defineProps<{
  callback: (email: string, password: string) => void;
  message: string;
}>();
</script>

<template>
  <div class="flex justify-center mt-12">
    <div class="max-w-md grid gap-2 w-full">
      <h1 class="text-lg">{{ props.message }}</h1>
      <label>
        <span class="text-xs"> Email </span>
        <input
          placeholder="user@gmail.com"
          class="input input-bordered block w-full"
          v-model="email"
        />
      </label>
      <label>
        <span class="text-xs"> Password </span>
        <input
          v-model="password"
          type="password"
          class="input input-bordered block w-full"
        />
      </label>
      <button class="btn mt-6" @click="() => props.callback(email, password)">
        login
      </button>
    </div>
  </div>
</template>
