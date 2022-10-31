<script lang="ts" setup>
import { UserSession } from "~~/types/session";
import { Sheet } from "~~/types/sheet";

const sheets = inject("sheets") as Partial<Sheet>[];
const session = inject("session") as UserSession;

function createNewSheet() {
  fetch("/api/sheets", {
    method: "POST",
  }).then(async (res) => {
    res
      .json()
      .then((json) => {
        if (json?.id) {
          window.location.href = "/sheets/" + json.id;
        } else {
          alert(json.message);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  });
}
</script>

<template>
  <div class="flex justify-center py-4">
    <div class="max-w-md w-full gap-2 grid auto-rows-min" v-if="session?.user">
      <h1 class="text-2xl">Your Sheets</h1>
      <button class="btn btn-primary btn-sm" @click="createNewSheet">
        new sheet
      </button>
      <a
        :href="'/sheets/' + sheet.id"
        class="btn w-full"
        v-for="sheet in sheets"
      >
        {{ sheet.name }}
      </a>
    </div>
    <div v-else class="max-w-md w-full gap-2 grid auto-rows-min">
      <h1 class="text-2xl">JavaScript Spreadsheets</h1>
      <p class="text-sm">Run JavaScript inside each cell of a spreadsheet.</p>
      <a href="/signup" class="btn btn-primary btn-sm">sign up</a>
      <a href="/login" class="btn btn-sm">sign in</a>
    </div>
  </div>
</template>
