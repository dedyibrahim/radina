import './bootstrap';

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Radina News';
const appId = 'app';

const resolveInitialPage = () => {
    const legacyRoot = document.getElementById(appId);

    if (legacyRoot?.dataset?.page) {
        return JSON.parse(legacyRoot.dataset.page);
    }

    const pageScript = document.querySelector(`script[data-page="${appId}"]`);

    if (pageScript?.textContent) {
        return JSON.parse(pageScript.textContent);
    }

    return undefined;
};

createInertiaApp({
    id: appId,
    page: resolveInitialPage(),
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: {
        color: '#f97316',
        showSpinner: false,
    },
});
