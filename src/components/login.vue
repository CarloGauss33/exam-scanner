<script setup lang="ts">
  import { inject, ref, computed, onMounted } from "vue";
  import { useSessionStore } from "../store/session";
  import { pocketBaseSymbol } from "../symbols/injectionSymbols";

  const $pb = inject(pocketBaseSymbol);
  const session = useSessionStore();
  const provider = JSON.parse(localStorage.getItem('provider') || "0");
  const redirectUrl = "http://localhost:5173";

  onMounted(async () => {
    if (!provider) {
      const authMethods = await $pb.users.listAuthMethods();
      localStorage.setItem("provider", JSON.stringify(authMethods.authProviders[0]));
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      await $pb.users.authViaOAuth2(
            'google',
            code,
            provider?.codeVerifier,
            redirectUrl
        ).then((user) => {
          session.login(user);
        });
    }
  });


  const isLogged = computed(() => {
    return session.isLoggedIn as boolean;
  });

  function logout() {
    session.logout();
  }

</script>

<template>
<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-red-600">
  <div class="mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl bg-white p-14 rounded-lg shadow-md">
    <div v-if="!isLogged" class="flex flex-col space-y-4">
      <a :href="provider?.authUrl + redirectUrl"
          class="flex items-center justify-center bg-red-600 text-white p-3 rounded-md"
        >
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <span>Sign in with Google</span>
      </a>
    </div>
    <div v-else>
      <div class="flex flex-col space-y-2">
         You are logged in!
      </div>
    </div>
  </div>
</div>
</template>