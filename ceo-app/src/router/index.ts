import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import DashboardPage from '../views/DashboardPage.vue'
import ClientsPage from '../views/ClientsPage.vue'
import ClientDetailPage from '../views/ClientDetailPage.vue'
import BillingHistoryPage from '../views/BillingHistoryPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/clients',
    name: 'Clients',
    component: ClientsPage
  },
  {
    path: '/client/:id',
    name: 'ClientDetail',
    component: ClientDetailPage
  },
  {
    path: '/client/:id/billing',
    name: 'BillingHistory',
    component: BillingHistoryPage
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
