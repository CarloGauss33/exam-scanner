import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { pocketBaseSymbol } from "./symbols/injectionSymbols";
import App from './App.vue';
import client from './pocketbase';
import './index.css';


import Login from './components/login.vue';
import Scanner from './components/scanner.vue';

const routes = [
    {
        path: '/',
        component: Login,
    },
    {
        path: '/scanner',
        component: Scanner,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});


const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.provide(pocketBaseSymbol, client);

app.mount('#app');
