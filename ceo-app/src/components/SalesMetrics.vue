<template>
  <div class="sales-metrics">
    <ion-card>
      <ion-card-header>
        <ion-card-title>Métricas del Pipeline</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div class="metrics-grid">
          <!-- Valor Total del Pipeline -->
          <div class="metric-item">
            <div class="metric-value">
              RD$ {{ formatCurrency(reporte.totalValor) }}
            </div>
            <div class="metric-label">Valor Total Pipeline</div>
          </div>

          <!-- Valor Ponderado -->
          <div class="metric-item">
            <div class="metric-value weighted">
              RD$ {{ formatCurrency(reporte.valorPonderado) }}
            </div>
            <div class="metric-label">Valor Ponderado</div>
          </div>

          <!-- Total de Prospectos -->
          <div class="metric-item">
            <div class="metric-value">
              {{ metricas.totalProspectos }}
            </div>
            <div class="metric-label">Total Prospectos</div>
          </div>

          <!-- Tasa de Conversión -->
          <div class="metric-item">
            <div class="metric-value conversion">
              {{ (metricas.tasaConversionGeneral * 100).toFixed(1) }}%
            </div>
            <div class="metric-label">Tasa Conversión</div>
          </div>
        </div>

        <!-- Distribución por Etapa -->
        <div class="stage-distribution">
          <h4>Distribución por Etapa</h4>
          <div class="stages-grid">
            <div
              v-for="etapa in reporte.distribucionPorEtapa"
              :key="etapa.etapa"
              class="stage-item"
              :class="etapa.etapa"
            >
              <div class="stage-header">
                <span class="stage-name">{{ getStageName(etapa.etapa) }}</span>
                <ion-badge :color="getStageColor(etapa.etapa)">
                  {{ etapa.cantidad }}
                </ion-badge>
              </div>
              <div class="stage-value">
                RD$ {{ formatCurrency(etapa.valor) }}
              </div>
              <div class="stage-percentage">
                {{ etapa.porcentaje.toFixed(1) }}% del total
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: etapa.porcentaje + '%' }"
                  :class="etapa.etapa"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Próximas Actividades -->
        <div class="upcoming-activities">
          <h4>Próximas Actividades (30 días)</h4>
          <div v-if="proximasActividades.length === 0" class="no-activities">
            <ion-icon :icon="calendar" size="large"></ion-icon>
            <p>No hay actividades próximas</p>
          </div>
          <div v-else class="activities-list">
            <div
              v-for="actividad in proximasActividades"
              :key="actividad.clienteId"
              class="activity-item"
            >
              <div class="activity-info">
                <h5>{{ actividad.nombreCliente }}</h5>
                <p class="activity-date">
                  <ion-icon :icon="calendar"></ion-icon>
                  {{ formatDate(actividad.fechaEstimada) }}
                  <span
                    class="days-remaining"
                    :class="{ urgent: actividad.diasRestantes <= 7 }"
                  >
                    ({{ actividad.diasRestantes }} días)
                  </span>
                </p>
              </div>
              <div class="activity-probability">
                <ion-chip
                  :color="getProbabilityColor(actividad.probabilidad)"
                  size="small"
                >
                  {{ actividad.probabilidad }}%
                </ion-chip>
              </div>
            </div>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonChip,
  IonIcon,
} from "@ionic/vue";
import { calendar } from "ionicons/icons";
import { computed, onMounted, ref } from "vue";
import { salesDataService } from "../services/SalesDataService";

// Reactive data
const reporte = ref(salesDataService.getReportePipeline());
const metricas = ref(salesDataService.getMetricasVentas());
const proximasActividades = ref(salesDataService.getProximasActividades());

// Methods
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStageName = (stage: string) => {
  const stageNames = {
    contacto: "Contacto",
    propuesta: "Propuesta",
    negociacion: "Negociación",
    cierre: "Cierre",
  };
  return stageNames[stage as keyof typeof stageNames] || stage;
};

const getStageColor = (stage: string) => {
  const stageColors = {
    contacto: "primary",
    propuesta: "warning",
    negociacion: "tertiary",
    cierre: "success",
  };
  return stageColors[stage as keyof typeof stageColors] || "medium";
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 80) return "success";
  if (probability >= 60) return "warning";
  if (probability >= 40) return "tertiary";
  return "medium";
};

// Refresh data
const refreshData = () => {
  reporte.value = salesDataService.getReportePipeline();
  metricas.value = salesDataService.getMetricasVentas();
  proximasActividades.value = salesDataService.getProximasActividades();
};

onMounted(() => {
  refreshData();
});

// Expose refresh method
defineExpose({
  refreshData,
});
</script>

<style scoped>
.sales-metrics {
  padding: 8px 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-item {
  text-align: center;
  padding: 12px 8px;
  background: var(--ion-color-light);
  border-radius: 6px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-bottom: 2px;
}

.metric-value.weighted {
  color: var(--ion-color-success);
}

.metric-value.conversion {
  color: var(--ion-color-tertiary);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--ion-color-medium-shade);
}

.stage-distribution {
  margin-bottom: 24px;
}

.stage-distribution h4 {
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stage-item {
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--ion-color-medium);
}

.stage-item.contacto {
  border-left-color: var(--ion-color-primary);
}

.stage-item.propuesta {
  border-left-color: var(--ion-color-warning);
}

.stage-item.negociacion {
  border-left-color: var(--ion-color-tertiary);
}

.stage-item.cierre {
  border-left-color: var(--ion-color-success);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-name {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.stage-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--ion-color-dark);
  margin-bottom: 4px;
}

.stage-percentage {
  font-size: 0.85rem;
  color: var(--ion-color-medium-shade);
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background: var(--ion-color-light-shade);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.contacto {
  background: var(--ion-color-primary);
}

.progress-fill.propuesta {
  background: var(--ion-color-warning);
}

.progress-fill.negociacion {
  background: var(--ion-color-tertiary);
}

.progress-fill.cierre {
  background: var(--ion-color-success);
}

.upcoming-activities h4 {
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
}

.no-activities {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.no-activities ion-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.activity-info h5 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: var(--ion-color-dark);
}

.activity-date {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium-shade);
  display: flex;
  align-items: center;
  gap: 4px;
}

.days-remaining {
  font-weight: 600;
}

.days-remaining.urgent {
  color: var(--ion-color-danger);
}

.activity-probability {
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stages-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .activity-probability {
    align-self: flex-end;
  }
}
</style>
