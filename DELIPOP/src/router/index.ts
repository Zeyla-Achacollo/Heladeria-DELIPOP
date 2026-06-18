import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProductsView from '@/views/ProductsView.vue'
import PromotionsView from '@/views/PromotionsView.vue'
import PromotionDetailView from '@/views/PromotionDetailView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import OrdersView from '@/views/OrdersView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/products', name: 'Products', component: ProductsView },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetailView, props: true },
  { path: '/promotions', name: 'Promotions', component: PromotionsView },
  { path: '/promotions/:id', name: 'PromotionDetail', component: PromotionDetailView, props: true },
  { path: '/cart', name: 'Cart', component: CartView },
  { path: '/checkout', name: 'Checkout', component: CheckoutView },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/contact', name: 'Contact', component: ContactView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView },
  { path: '/orders', name: 'Orders', component: OrdersView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
