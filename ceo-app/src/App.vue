<template>
  <ion-app>
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>CEO App</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-menu-toggle :auto-hide="false">
            <ion-item @click="navigateTo('/dashboard')">
              <ion-icon slot="start" :icon="analytics"></ion-icon>
              <ion-label>Dashboard</ion-label>
            </ion-item>

            <ion-item @click="navigateTo('/clients')">
              <ion-icon slot="start" :icon="people"></ion-icon>
              <ion-label>Clientes</ion-label>
            </ion-item>

            <ion-item @click="navigateTo('/employees')">
              <ion-icon slot="start" :icon="person"></ion-icon>
              <ion-label>Empleados</ion-label>
            </ion-item>

            <ion-item @click="navigateTo('/quoter')">
              <ion-icon slot="start" :icon="calculator"></ion-icon>
              <ion-label>Cotizador</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <ion-list>
          <ion-menu-toggle :auto-hide="false">
            <ion-item @click="navigateTo('/profile')">
              <ion-icon slot="start" :icon="person"></ion-icon>
              <ion-label>Mi Perfil</ion-label>
            </ion-item>
            <ion-item @click="logout" color="danger">
              <ion-icon slot="start" :icon="logOut"></ion-icon>
              <ion-label>Logout</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from "@ionic/vue";
import { analytics, logOut, people, person, calculator } from "ionicons/icons";
import { useRouter } from "vue-router";

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};

const logout = () => {
  // Aquí puedes agregar la lógica de logout
  console.log("Logout clicked");
  // Por ahora solo navegamos a dashboard
  router.push("/dashboard");
};
</script>

<style scoped>
/* Pointer cursor on clickable menu items */
ion-menu ion-item {
  cursor: pointer;
}
</style>
