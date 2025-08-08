import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import DashboardPage from '../views/DashboardPage.vue'
import ClientsPage from '../views/ClientsPage.vue'
import ClientDetailPage from '../views/ClientDetailPage.vue'
import BillingHistoryPage from '../views/BillingHistoryPage.vue'
import StageDetailPage from '../views/StageDetailPage.vue'
import QuoterPage from '../views/QuoterPage.vue'
import UserProfilePage from '../views/UserProfilePage.vue'
import EmployeesPage from '../views/EmployeesPage.vue'
import EmployeeDetailPage from '../views/EmployeeDetailPage.vue'

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
  {
    path: '/negotiation/:negotiationId/stage/:stageId',
    name: 'StageDetail',
    component: StageDetailPage
  },
  {
    path: '/quoter',
    name: 'Quoter',
    component: QuoterPage
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfilePage
  },
  {
    path: '/employees',
    name: 'Employees',
    component: EmployeesPage
  },
  {
    path: '/employee/:id',
    name: 'EmployeeDetail',
    component: EmployeeDetailPage
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
