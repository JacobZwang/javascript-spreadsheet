<script lang="ts" setup>
function signup(email: string, password: string) {
  fetch("/api/signup", {
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
  <Enter :callback="signup" message="Sign Up" />
</template>
