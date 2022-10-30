<script lang="ts" setup>
function login(email: string, password: string) {
  fetch("/api/users/login", {
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
  <Enter :callback="login" message="Login" />
</template>
