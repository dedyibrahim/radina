import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PublicLayout from '../layouts/PublicLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (to.path === from.path && (to.path.startsWith('/w/') || to.meta.preview)) return false
    return saved || (to.hash ? { el: to.hash, top: 80, behavior: 'smooth' } : { top: 0 })
  },
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', component: () => import('../pages/public/Home.vue') },
        { path: 'buket', component: () => import('../pages/public/Bouquets.vue') },
        { path: 'bucket', redirect: '/buket' },
        { path: 'templates', component: () => import('../pages/public/Templates.vue') },
        { path: 'templates/:slug', component: () => import('../pages/public/TemplateDetail.vue') },
        {
          path: 'order/success/:number',
          component: () => import('../pages/public/OrderSuccess.vue'),
        },
        { path: 'order/:template', component: () => import('../pages/public/Order.vue') },
        { path: 'check-order', component: () => import('../pages/public/CheckOrder.vue') },
      ],
    },
    {
      path: '/templates/:slug/preview',
      component: () => import('../pages/public/Wedding.vue'),
      meta: { preview: true },
    },
    { path: '/w/:slug', component: () => import('../pages/public/Wedding.vue') },
    {
      path: '/preview/wedding/:id',
      component: () => import('../pages/public/Wedding.vue'),
      meta: { admin: true, preview: true },
    },
    {
      path: '/admin/weddings/:id/preview',
      component: () => import('../pages/public/Wedding.vue'),
      meta: { admin: true, preview: true },
    },
    { path: '/admin/login', component: () => import('../pages/admin/Login.vue') },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { admin: true },
      children: [
        { path: '', component: () => import('../pages/admin/Dashboard.vue') },
        { path: 'orders', component: () => import('../pages/admin/Orders.vue') },
        { path: 'orders/:id', component: () => import('../pages/admin/OrderDetail.vue') },
        {
          path: 'weddings/:id/gift',
          component: () => import('../pages/admin/WeddingEditor.vue'),
          meta: { section: 'gift' },
        },
        { path: 'weddings/:id', component: () => import('../pages/admin/WeddingEditor.vue') },
        { path: 'templates', component: () => import('../pages/admin/Templates.vue') },
        { path: 'music', component: () => import('../pages/admin/MusicLibrary.vue') },
        { path: 'settings', component: () => import('../pages/admin/Settings.vue') },
        { path: 'licenses', component: () => import('../pages/admin/Licenses.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFound.vue') },
  ],
})
router.beforeEach(async (to) => {
  if (to.meta.admin) {
    const auth = useAuthStore()
    await auth.restore()
    if (!auth.user) return { path: '/admin/login', query: { redirect: to.fullPath } }
  }
})
export default router
