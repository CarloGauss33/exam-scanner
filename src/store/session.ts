import { defineStore } from 'pinia';

export const useSessionStore = defineStore({
    id: 'session',
    state: () => ({
        user: JSON.parse(localStorage.getItem('pocketbase_auth') || 'null')?.model,
    }),

    getters: {
        isLoggedIn() {
            return !!this.user;
        },
    },

    actions: {
        login(user) {
            this.user = user
        },

        logout() {
            this.user = null
        },
    },
})
