<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dashboard</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="dashboard-container">
        <!-- KPIs Cards -->
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="4">
              <ion-card class="kpi-card">
                <ion-card-header>
                  <ion-card-title>Total Facturado</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="kpi-value">
                    RD$ {{ totalFacturado.toLocaleString("es-DO") }}
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="4">
              <ion-card class="kpi-card">
                <ion-card-header>
                  <ion-card-title>Total Pagado</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="kpi-value">
                    RD$ {{ totalPagado.toLocaleString("es-DO") }}
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="4">
              <ion-card class="kpi-card">
                <ion-card-header>
                  <ion-card-title>Porcentaje Logrado</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="kpi-value">{{ porcentajeLogrado }}%</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Clientes con Cuotas Vencidas -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Clientes con Cuotas Vencidas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item
                v-for="cliente in clientesVencidos"
                :key="cliente.id"
                color="danger"
              >
                <ion-label>
                  <h2>{{ cliente.nombre }}</h2>
                  <p>{{ cliente.cuotasVencidas }} cuotas vencidas</p>
                </ion-label>
                <ion-note slot="end">
                  RD$ {{ cliente.montoPendiente }}
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
} from "@ionic/vue";
import { computed, onMounted } from "vue";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Computed properties for KPIs
const totalFacturado = computed(() => billingStore.totalBilled);
const totalPagado = computed(() => billingStore.totalPaid);
const porcentajeLogrado = computed(() => billingStore.paymentPercentage);

// Computed properties for overdue clients
const clientesVencidos = computed(() =>
  clientsStore.getClientsWithFinancialData.filter(
    (cliente) => cliente.cuotasVencidas > 0
  )
);

// Load data on mount
onMounted(async () => {
  await Promise.all([clientsStore.loadClients(), billingStore.loadBilling()]);
});
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.kpi-card {
  text-align: center;
  margin-bottom: 16px;
}

.kpi-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

ion-card {
  margin-bottom: 16px;
}
</style>
