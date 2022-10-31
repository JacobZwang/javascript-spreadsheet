<script lang="ts" setup>
function login(email: string, password: string) {
  fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  }).then(async (res) => {
    res
      .json()
      .then((json) => {
        if (json?.id) {
          window.location.href = "/";
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
  <Enter :callback="login" message="Login" />
</template>
