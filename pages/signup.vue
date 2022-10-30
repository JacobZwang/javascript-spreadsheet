<script lang="ts" setup>
function signup(email: string, password: string) {
  fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  }).then(async (res) => {
    if (res.ok) {
      console.log(await res.json());
    }
  });
}
</script>

<template>
  <Enter :callback="signup" message="Sign Up" />
</template>
