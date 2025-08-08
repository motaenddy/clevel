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
        <!-- KPIs Expandidos -->
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card class="kpi-card">
                <ion-card-header>
                  <ion-card-title>Total Facturado</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="kpi-value">
                    RD$ {{ totalFacturadoMesAnterior.toLocaleString("es-DO") }}
                  </div>
                  <div class="kpi-subtitle">Mes anterior</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="6">
              <ion-card class="kpi-card">
                <ion-card-header>
                  <ion-card-title>Total Cobrado</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="kpi-value">
                    RD$ {{ totalCobradoEsteMes.toLocaleString("es-DO") }}
                  </div>
                  <div class="kpi-subtitle">
                    {{ porcentajeCobranza }}% de cobranza
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Pipeline de Ventas -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Pipeline de Ventas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col
                  size="6"
                  size-md="3"
                  v-for="stage in salesPipeline"
                  :key="stage.name"
                >
                  <div class="pipeline-stage">
                    <div class="stage-header">{{ stage.name }}</div>
                    <div class="stage-count">{{ stage.count }}</div>
                    <div class="stage-value">
                      RD$ {{ stage.value.toLocaleString("es-DO") }}
                    </div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Métricas de Implementación -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Implementaciones</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="metric-item">
                    <div class="metric-label">Pendientes</div>
                    <div class="metric-value">
                      {{ implementacionesPendientes }}
                    </div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="metric-item">
                    <div class="metric-label">Valor Total</div>
                    <div class="metric-value">
                      RD$ {{ valorImplementaciones.toLocaleString("es-DO") }}
                    </div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Actividad Reciente -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Actividad Reciente</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="actividadReciente.length > 0">
              <ion-item
                v-for="activity in actividadReciente"
                :key="activity.id"
              >
                <ion-icon
                  :icon="getActivityIcon(activity.type)"
                  slot="start"
                  :color="getActivityColor(activity.type)"
                ></ion-icon>
                <ion-label>
                  <h3>{{ activity.title }}</h3>
                  <p>{{ activity.description }}</p>
                  <p class="activity-time">
                    {{ formatTime(activity.timestamp) }}
                  </p>
                </ion-label>
              </ion-item>
            </ion-list>
            <div v-else class="empty-state">
              <ion-icon
                :icon="informationCircle"
                size="large"
                color="medium"
              ></ion-icon>
              <p>No hay actividad reciente</p>
            </div>
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
  IonIcon,
} from "@ionic/vue";
import { informationCircle } from "ionicons/icons";
import { computed, onMounted } from "vue";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Computed properties for KPIs - Enfoque en Cobranza
const getPreviousMonth = () => {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return previousMonth.toISOString().slice(0, 7); // "2024-01" format
};

const getCurrentMonth = () => {
  const now = new Date();
  return now.toISOString().slice(0, 7); // "2024-01" format
};

const totalFacturadoMesAnterior = computed(() => {
  const previousMonth = getPreviousMonth();
  const billingForMonth = billingStore.getBillingByMonth(previousMonth);
  return billingForMonth.reduce((sum, b) => sum + b.montoFacturado, 0);
});

const totalCobradoEsteMes = computed(() => {
  const currentMonth = getCurrentMonth();
  const billingForMonth = billingStore.getBillingByMonth(currentMonth);
  return billingForMonth.reduce((sum, b) => sum + b.montoPagado, 0);
});

const porcentajeCobranza = computed(() => {
  if (totalFacturadoMesAnterior.value === 0) return 0;
  return Math.round(
    (totalCobradoEsteMes.value / totalFacturadoMesAnterior.value) * 100
  );
});

// Pipeline de ventas
const salesPipeline = computed(() => {
  const stages = [
    {
      name: "Contacto",
      count: Math.floor(Math.random() * 5) + 2,
      value: Math.floor(Math.random() * 1000000) + 500000,
    },
    {
      name: "Propuesta",
      count: Math.floor(Math.random() * 4) + 1,
      value: Math.floor(Math.random() * 1500000) + 800000,
    },
    {
      name: "Negociación",
      count: Math.floor(Math.random() * 3) + 1,
      value: Math.floor(Math.random() * 2000000) + 1000000,
    },
    {
      name: "Cierre",
      count: Math.floor(Math.random() * 2) + 1,
      value: Math.floor(Math.random() * 2500000) + 1500000,
    },
  ];
  return stages;
});

// Métricas de implementación
const implementacionesPendientes = computed(() => {
  return Math.floor(Math.random() * 8) + 3; // 3-10 implementaciones
});

const valorImplementaciones = computed(() => {
  return Math.floor(Math.random() * 3000000) + 1500000; // 1.5M-4.5M
});

// Actividad reciente
const actividadReciente = computed(() => {
  const activities = [];

  // Agregar actividades de facturación
  billingStore.billing.slice(0, 5).forEach((billing) => {
    const client = clientsStore.getClientById(billing.clienteId);
    const clientName = client ? client.nombre : `Cliente ${billing.clienteId}`;
    const timestamp = new Date(billing.mes + "-01"); // Usar el mes como timestamp

    activities.push({
      id: `billing-${billing.id}`,
      type: "billing",
      title: `Facturación - ${clientName}`,
      description: `RD$ ${billing.montoFacturado.toLocaleString("es-DO")}`,
      timestamp: timestamp,
    });
  });

  // Agregar actividades simuladas de negociación
  for (let i = 0; i < 3; i++) {
    activities.push({
      id: `negotiation-${i}`,
      type: "negotiation",
      title: `Negociación actualizada`,
      description: `Cliente: Cliente ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
    });
  }

  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 8);
});

// Funciones de utilidad
const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    billing: "card",
    negotiation: "trendingUp",
    quote: "calculator",
    implementation: "construct",
  };
  return icons[type] || "informationCircle";
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    billing: "success",
    negotiation: "primary",
    quote: "warning",
    implementation: "secondary",
  };
  return colors[type] || "medium";
};

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
  height: 100%;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.kpi-subtitle {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.pipeline-stage {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: var(--ion-color-light);
  margin-bottom: 8px;
  height: 100%;
}

.stage-header {
  font-weight: bold;
  color: var(--ion-color-dark);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.stage-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.stage-value {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.metric-item {
  text-align: center;
  padding: 16px;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

ion-card {
  margin-bottom: 16px;
}

ion-item[button] {
  cursor: pointer;
}

ion-item[button]:hover {
  background-color: var(--ion-color-light);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kpi-value {
    font-size: 1.5rem;
  }

  .stage-count {
    font-size: 1.2rem;
  }

  .metric-value {
    font-size: 1rem;
  }
}
</style>
