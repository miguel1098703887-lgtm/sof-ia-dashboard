# Proyecto Sof-IA: Dashboard de Telemonitoreo Rural

## Descripción
Este es un dashboard interactivo desarrollado como Prueba de Concepto (PoC) para el sistema Sof-IA. Está diseñado bajo los estándares de **Software como Dispositivo Médico (SaMD)**, enfocándose en la seguridad del paciente y la bioseguridad algorítmica.

## Características Implementadas

### 1. Panel de Triaje (Digital Twins)
- Visualización de 10 pacientes simulados (basados en modelos in-silico UVA/Padova).
- Ubicación rural (Onzaga, San Joaquín, etc.) con indicadores de conectividad intermitente.
- Métricas en tiempo real: Glucosa, Tendencia y Tiempo en Rango (TIR).

### 2. Limitador Determinista (Sidecar Pattern)
- **Bioseguridad Algorítmica:** Se implementó un panel de auditoría que contrasta la recomendación del LLM con una validación determinista estricta.
- **Prevención de Iatrogenia:** El sistema bloquea automáticamente recomendaciones peligrosas (ej. sugerir insulina en hipoglucemia) basándose en las Guías de Práctica Clínica (GPC) de Diabetes de Colombia.

### 3. Mitigación de Fatiga de Alarmas
- Bandeja de notificaciones con filtrado inteligente.
- Bloqueo de alarmas redundantes o variaciones no críticas para proteger la salud mental del personal clínico.

### 4. Comparativa Asincrónica vs Tiempo Real
- Switch funcional para alternar entre la vista retrospectiva (tradicional, alto riesgo) y la vista autónoma asistida (preventiva, bajo riesgo).

## Tecnologías
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Alto contraste hospitalario)
- **Iconografía:** Lucide React

## Instrucciones para Ejecutar
1. `cd sof-ia-dashboard`
2. `npm install`
3. `npm run dev`
