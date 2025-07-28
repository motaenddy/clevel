<template>
  <ion-card class="negotiation-pipeline">
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="trendingUp" slot="start"></ion-icon>
        Estado de Negociación
      </ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <!-- Pipeline Visual -->
      <div class="pipeline-container">
        <div
          v-for="stage in negotiation.stages"
          :key="stage.id"
          class="stage-item"
          :class="{
            completed: isStageCompleted(stage.id),
            current: isCurrentStage(stage.id),
            upcoming: isUpcomingStage(stage.id),
          }"
          @click="selectStage(stage.id)"
        >
          <div class="stage-icon" :style="{ backgroundColor: stage.color }">
            <ion-icon :icon="getIcon(stage.icon)"></ion-icon>
          </div>
          <div class="stage-info">
            <h4>{{ stage.name }}</h4>
            <p>{{ stage.description }}</p>
            <div
              v-if="getStageProgress(stage.id).total > 0"
              class="stage-progress"
            >
              <span class="progress-text"
                >{{ getStageProgress(stage.id).completed }}/{{
                  getStageProgress(stage.id).total
                }}
                sub-etapas</span
              >
            </div>
            <div v-if="getLatestCompletedSubStage(stage.id)" class="stage-date">
              <ion-icon :icon="calendar" size="small"></ion-icon>
              <span
                >{{ getLatestCompletedSubStage(stage.id)?.name }} -
                {{
                  formatDate(
                    getLatestCompletedSubStage(stage.id)?.completedDate!
                  )
                }}</span
              >
            </div>
            <div
              v-else-if="getStageProgress(stage.id).completed > 0"
              class="stage-date"
            >
              <ion-icon :icon="calendar" size="small"></ion-icon>
              <span
                >{{ getStageProgress(stage.id).completed }}/{{
                  getStageProgress(stage.id).total
                }}
                sub-etapas completadas</span
              >
            </div>
          </div>
          <div class="stage-status">
            <ion-icon
              v-if="isStageCompleted(stage.id)"
              :icon="checkmarkCircle"
              color="success"
            ></ion-icon>
            <ion-icon
              v-else-if="isCurrentStage(stage.id)"
              :icon="ellipse"
              color="primary"
            ></ion-icon>
            <ion-icon v-else :icon="ellipseOutline" color="medium"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Información de la Negociación -->
      <div class="negotiation-info">
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Probabilidad</ion-label>
                <ion-progress-bar
                  :value="negotiation.probability / 100"
                  :color="getProgressColor(negotiation.probability)"
                ></ion-progress-bar>
                <span class="progress-text"
                  >{{ negotiation.probability }}%</span
                >
              </div>
            </ion-col>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Valor Estimado</ion-label>
                <span class="value-text"
                  >RD$ {{ formatCurrency(negotiation.estimatedValue) }}</span
                >
              </div>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Fecha Inicio</ion-label>
                <span class="date-text">{{
                  formatDate(negotiation.startDate)
                }}</span>
              </div>
            </ion-col>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Última Actualización</ion-label>
                <span class="date-text">{{
                  formatDate(negotiation.lastUpdate)
                }}</span>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
} from "@ionic/vue";
import {
  trendingUp,
  checkmarkCircle,
  ellipse,
  ellipseOutline,
  person,
  documentText,
  chatbubbles,
  checkmarkCircle as checkmarkCircleIcon,
  card,
  playCircle,
  checkmarkDoneCircle,
  trendingUp as trendingUpIcon,
  calendar,
} from "ionicons/icons";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Negotiation } from "../types/negotiation";
import { NegotiationService } from "../services/NegotiationService";

const props = defineProps<{
  negotiation: Negotiation;
}>();

const emit = defineEmits<{
  update: [negotiation: Negotiation];
}>();

const router = useRouter();
const negotiationService = new NegotiationService();

// Methods
const isStageCompleted = (stageId: string): boolean => {
  const stage = props.negotiation.stages.find((s) => s.id === stageId);
  if (!stage || !stage.subStages || stage.subStages.length === 0) {
    // Si no hay sub-etapas, usar la lógica original
    const currentIndex = props.negotiation.stages.findIndex(
      (s) => s.id === props.negotiation.currentStage
    );
    const stageIndex = props.negotiation.stages.findIndex(
      (s) => s.id === stageId
    );
    return stageIndex < currentIndex;
  }

  // Verificar que todas las sub-etapas estén completadas
  return stage.subStages.every((subStage) => subStage.completed);
};

const isCurrentStage = (stageId: string): boolean => {
  // Una etapa es actual si es la etapa designada como currentStage Y tiene sub-etapas en progreso
  if (stageId !== props.negotiation.currentStage) {
    return false;
  }

  const stage = props.negotiation.stages.find((s) => s.id === stageId);
  if (!stage || !stage.subStages || stage.subStages.length === 0) {
    return true; // Si no hay sub-etapas, es la etapa actual
  }

  // Es etapa actual si tiene sub-etapas pero no todas están completadas
  const completedSubStages = stage.subStages.filter(
    (subStage) => subStage.completed
  ).length;
  return completedSubStages > 0 && completedSubStages < stage.subStages.length;
};

const isUpcomingStage = (stageId: string): boolean => {
  // Una etapa es futura si no está completada y no es la actual
  return !isStageCompleted(stageId) && !isCurrentStage(stageId);
};

// Calcular progreso de sub-etapas para una etapa
const getStageProgress = (
  stageId: string
): { completed: number; total: number; percentage: number } => {
  const stage = props.negotiation.stages.find((s) => s.id === stageId);
  if (!stage || !stage.subStages || stage.subStages.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = stage.subStages.filter(
    (subStage) => subStage.completed
  ).length;
  const total = stage.subStages.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  // Debug: Log para verificar los datos
  console.log(`Stage ${stageId}:`, {
    total: total,
    completed: completed,
    subStages: stage.subStages.map((s) => ({
      name: s.name,
      completed: s.completed,
    })),
  });

  return { completed, total, percentage };
};

const getLatestCompletedSubStage = (stageId: string) => {
  const stage = props.negotiation.stages.find((s) => s.id === stageId);
  if (!stage || !stage.subStages || stage.subStages.length === 0) {
    return null;
  }

  // Obtener sub-etapas completadas ordenadas por fecha de completado (más reciente primero)
  const completedSubStages = stage.subStages
    .filter((subStage) => subStage.completed && subStage.completedDate)
    .sort(
      (a, b) =>
        new Date(b.completedDate!).getTime() -
        new Date(a.completedDate!).getTime()
    );

  return completedSubStages.length > 0 ? completedSubStages[0] : null;
};

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    person,
    "document-text": documentText,
    chatbubbles,
    "checkmark-circle": checkmarkCircleIcon,
    card,
    "play-circle": playCircle,
    "checkmark-done-circle": checkmarkDoneCircle,
    "trending-up": trendingUpIcon,
  };
  return iconMap[iconName] || person;
};

const getProgressColor = (probability: number): string => {
  if (probability >= 80) return "success";
  if (probability >= 50) return "warning";
  return "danger";
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString("es-DO");
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("es-DO");
};

const selectStage = (stageId: string) => {
  // Navegar a la vista de sub-etapas
  router.push(`/negotiation/${props.negotiation.id}/stage/${stageId}`);
};

// Método para recargar datos cuando se regresa de la vista de sub-etapas
const reloadNegotiation = async () => {
  try {
    const updatedNegotiation = await negotiationService.getNegotiationById(
      props.negotiation.id
    );
    if (updatedNegotiation) {
      emit("update", updatedNegotiation);
    }
  } catch (error) {
    console.error("Error reloading negotiation:", error);
  }
};

// Recargar datos cuando el componente se enfoca (cuando se regresa de sub-etapas)
onMounted(() => {
  window.addEventListener("focus", reloadNegotiation);
});

onUnmounted(() => {
  window.removeEventListener("focus", reloadNegotiation);
});
</script>

<style scoped>
.negotiation-pipeline {
  margin: 16px;
}

.pipeline-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stage-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--ion-color-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stage-item:hover {
  background-color: var(--ion-color-light);
}

.stage-item.completed {
  background-color: #e8f5e8;
  border-color: #90ee90;
}

.stage-item.current {
  background-color: var(--ion-color-primary-tint);
  border-color: var(--ion-color-primary);
}

.stage-item.upcoming {
  /* Etapas futuras se muestran normalmente sin transparencia */
}

.stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.stage-info {
  flex: 1;
}

.stage-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.stage-info p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.stage-date {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--ion-color-success);
}

.stage-progress {
  margin-top: 4px;
}

.stage-progress .progress-text {
  font-size: 10px;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.stage-status {
  margin-left: 8px;
}

.negotiation-info {
  margin: 20px 0;
}

.info-item {
  margin-bottom: 16px;
}

.info-item ion-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.progress-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.value-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.date-text {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>
