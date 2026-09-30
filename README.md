# ⚡ ATP STRENGTH (NEURO//STRENGTH)
### Plataforma de Rendimiento Neuromuscular, Resíntesis de ATP y Fuerza Máxima

[![Production Status](https://img.shields.io/badge/Production-Live-emerald?style=for-the-badge&logo=vercel)](https://atp-strength.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.4_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-Mobile_Optimized-purple?style=for-the-badge&logo=pwa)](https://atp-strength.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

---

## 🌐 Enlaces Oficiales de Producción

| Módulo | Enlace Directo | Utilidad Principal |
| :--- | :--- | :--- |
| 🚀 **Templo Zen (App Principal)** | **[atp-strength.vercel.app](https://atp-strength.vercel.app)** | Dashboard de entrenamiento diario, itinerarios, cronómetro de ATP y registro de series. |
| ⚡ **Calculadora Universal Móvil** | **[atp-strength.vercel.app/calc](https://atp-strength.vercel.app/calc)** | Cabina universal de fuerza adaptable a cualquier ejercicio (barra, mancuerna o máquina). |
| ⚔️ **La Forja de Guerreros** | **[atp-strength.vercel.app/forge](https://atp-strength.vercel.app/forge)** | Manifiesto de fuerza real, principios de los strongman clásicos y motivación pura. |

---

## 📱 1. Optimización Móvil & Experiencia Gym-First (PWA)

ATP STRENGTH fue diseñado pensando en el lugar donde realmente se entrena: **el gimnasio, directo desde tu celular**.

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPERIENCIA EN CELULAR                   │
│                                                             │
│  [⚡ Wake Lock]       Pantalla encendida durante la sesión   │
│  [👆 Touch Steppers]  Ajuste rápido de carga (+/- 2.5, 5 kg) │
│  [⏱️ Mini-Timer HUD]  HUD flotante de descanso ATP visible   │
│  [🖤 True Black]      Modo OLED puro (ahorro de batería)     │
│  [📶 Offline-First]   Registro WAL activo sin internet       │
│  [🔊 Web Audio]       Beeps y metrónomo sin consumir datos   │
└─────────────────────────────────────────────────────────────┘
```

* **Instalable como App Nativa (PWA):**
  * **iOS (iPhone):** Abrí Safari $\to$ Compartir $\to$ *"Agregar al inicio"*.
  * **Android:** Abrí Chrome $\to$ Menú (3 puntos) $\to$ *"Instalar aplicación"*.
* **Pantalla Siempre Activa (Wake Lock):** El celular no se bloquea ni se apaga mientras descansás entre series.
* **Mini-Timer HUD Flotante:** Un indicador compacto y persistente en el borde inferior del celular que te muestra la recarga de ATP en vivo sin importar en qué sección de la app estés navegando.
* **Touch Steppers Ergonómicos:** Botones táctiles grandes `[-5 kg]`, `[-2.5 kg]`, `[+2.5 kg]`, `[+5 kg]` para calibrar el peso con tiza en las manos sin necesidad de desplegar el teclado móvil.
* **Ergonomía Táctil:** Touch targets $\ge$ 48px y alto contraste diseñados para condiciones reales de entrenamiento.

---

## 🏛️ 2. Los 5 Programas de Entrenamiento de la Suite

ATP STRENGTH integra **5 sistemas de entrenamiento científicamente calibrados** para cubrir todas las dimensiones de la fuerza humana:

| Programa | Enfoque Principal | Días / Estructura | Población Objetivo |
| :--- | :--- | :--- | :--- |
| ⚔️ **Forja del Guerrero** | Fuerza Funcional & Resiliencia | 4 Activos + 3 Descanso | Guerreros multidisciplinarios y levantadores completos. |
| 🏛️ **Ciclo Clásico** | Fuerza Absoluta & Tensión Miofibrilar | 4 Activos + 2 Descanso | Powerlifters y atletas de fuerza pura (Banca, Sentadilla, Peso Muerto). |
| 🥇 **Ciclo Olímpico** | Potencia, Triple Extensión & RFD | 4 Activos + 2 Descanso | Halterofilia, saltadores y atletas de Rate of Force Development. |
| ⚡ **Ciclo Híbrido** | Sinergia Fuerza + Potencia | 5 Activos + 2 Descanso | Atletas avanzados que buscan hipertrofia sarcomérica y velocidad. |
| 🎯 **Protocolo Universal (PR)** | Calibración & Progresión Continua | Dinámico / Cualquier Ejercicio | Levantamientos con barra, máquinas o ejercicios corporales lastrados. |

---

## ⚡ 3. Motor Universal de Fuerza (`/calc`, Modal y Programa Activo)

Un motor y cabina de mando **100% agnóstico al ejercicio**, disponible en:
1. Modal interactivo tocando `CALC FASES` en la barra superior.
2. Pantalla completa dedicada en `/calc`.
3. Programa de entrenamiento activo `Universal PR` dentro del selector de ciclos.

### A. Dos Modalidades de Entrada
1. **Balance Submáximo (Sin conocer tu PR):** Ingresás el peso que movés cómodo, las repeticiones logradas (ej. 6 reps) y las repeticiones en reserva (RIR 2). El motor calcula tu 1RM estimado mediante el algoritmo híbrido **Brzycki + Epley** sin riesgo de lesión.
2. **PR Directo:** Si ya conocés tu marca (ej. 70 kg, 100 kg), la ingresás directamente y calcula las 6 zonas al milímetro.

### B. Escudo 90% Training Max (Longevidad Física)
Calcula las cargas de trabajo efectivas sobre el **90% del 1RM real**. Esta directiva de los strongmen clásicos y del método Wendler protege las cápsulas articulares, ligamentos y tendones, eliminando el agotamiento del Sistema Nervioso Central (SNC).

### C. Las 6 Fases Neuromusculares
1. **Activación & Movilidad (20–30%):** Lubrica cartílagos con líquido sinovial y abre el canal neural.
2. **Rampa Progresiva (42–58%):** Aclimatación de colágeno y velocidad concéntrica.
3. **Potenciación Post-Activación (PAP) (68–76%):** Sincronización de motoneuronas rápidas (Tipo IIx) con máxima intención de aceleración.
4. **Fuerza Efectiva (80–85%):** Zona reina de tensión mecánica miofibrilar (3s excéntrica, pausa isométrica y explosión concéntrica).
5. **Umbral de Pico (88–92%):** Contracción voluntaria máxima sin ir al fallo.
6. **Vuelta a la Calma Parasimpática (38–48%):** Transición autonómica de estrés a recuperación y desinflamación celular.

---

## 🔬 4. Ciencia de Alto Rendimiento: Los 5 Laboratorios Integrados

### A. Autorregulación RPE/RIR (Mike Tuchscherer / Reactive Training Systems)
El sistema no asume que tu sistema nervioso está igual todos los días. Tras registrar una serie pesada con su RPE (Escala de Esfuerzo Percibido):
* **Detección de Fatiga (Overshoot $\ge +0.5$ RPE):** Si la serie se sintió más pesada que la prescripción, el motor calcula la fatiga neural acumulada y prescribe un ajuste a la baja (ej. $-2.5$ a $-5.0$ kg) para la siguiente serie.
* **Supercompensación (Undershoot $\ge -0.5$ RPE):** Si la barra voló a velocidad explosiva con mayor RIR del esperado, el motor recalcula el e1RM al alza y sugiere aumentar la carga de forma segura.

### B. Índice de Fatiga INOL Soviético (A.S. Prilepin 1974)
Calcula en tiempo real el estímulo y la fatiga acumulada del SNC mediante la fórmula universal:
$$\text{INOL} = \frac{\text{Repeticiones}}{100 - \%1\text{RM}}$$
* **$\text{INOL} < 0.40$:** Volumen ligero / Recuperación activa.
* **$\text{INOL } 0.40 - 1.00$:** **Rango Óptimo Soviético** para máxima ganancia de fuerza sin fatiga central excesiva.
* **$\text{INOL } 1.00 - 1.20$:** Carga alta al límite neuromuscular.
* **$\text{INOL} > 1.20$:** Riesgo de sobreentrenamiento; recomendación de cierre de sesión.

### C. Metrónomo de Tempo Neuromuscular 3-1-X-1
Pacer visual y acústico en 4 compases para maximizar la tensión mecánica y evitar el rebote lesivo:
* **3 Segundos Excéntrica:** Descenso hipercontrolado para reclutar unidades motoras de alto umbral.
* **1 Segundo Pausa Isométrica:** Disipación del reflejo miotático elástico en el punto de estiramiento.
* **X Explosión Concéntrica:** Máxima intención de aceleración (CAT - Compensatory Acceleration Training).
* **1 Segundo Bloqueo:** Estabilización y reseteo del brace intraabdominal.

### D. Visualizador Olímpico IWF de Discos por Lado
Muestra exactamente qué discos cargar en cada manga de la barra según los colores oficiales de la IWF (Federación Internacional de Halterofilia):
* **Rojo:** 25 kg
* **Azul:** 20 kg
* **Amarillo:** 15 kg
* **Verde:** 10 kg
* **Blanco:** 5 kg
* **Microdiscos:** 2.5 kg, 1.25 kg
* **Soporte de Implementos:** Barra Estándar (20 kg), Barra Olímpica Técnica (15 kg), Trap/Hex Bar (25 kg), Mancuernas/Lastre Corporal (0 kg).

### E. Biblioteca Anatoly de Técnica de Élite (25 Ejercicios)
Cada uno de los 25 movimientos trackeables cuenta con:
* Demostración en video de alta calidad sin duplicados.
* **Cues Biomecánicos Esenciales:** Posición de escápulas, ángulo de codos, vector de fuerza y brace.
* **Errores Comunes a Evitar:** Compensaciones lumbares, colapso de rodillas y pérdida de tensión isométrica.

---

## 🧠 5. Doctrinas del Coach & Resíntesis de ATP-CP

### A. Curva de Regeneración de Fosfocreatina
El ATP muscular de alta potencia se agota en 8 a 10 segundos de esfuerzo máximo. La ciencia bioenergética dicta los descansos exactos:
* **30 segundos:** 50% de recarga (deuda de oxígeno activa).
* **90 segundos:** 85% de recarga (glucólisis anaeróbica mitigada).
* **180 segundos (3 min):** 95% de recarga (resíntesis de fosfocreatina casi completa).
* **240–300 segundos (4–5 min):** 99% de supercompensación neural.

> **Regla de Oro:** Acortar los descansos por debajo de 3 minutos en series pesadas convierte el entrenamiento de fuerza en resistencia metabólica y degrada el sistema nervioso.

### B. Leyes Biomecánicas de Ejecución
1. **Aceleración Compensatoria (CAT):** Empujá cada repetición con 100% de intención de aceleración concéntrica. Fuerza = Masa $\times$ Aceleración.
2. **Bracing Neumático 360°:** Inhalá hacia el piso pélvico y costillas bajas expandiendo el torso. Creá presión intraabdominal (IAP) para blindar la columna.
3. **Irradiación Neural (Ley de Sherrington):** Apretá la barra o mancuerna con agarre de hierro. La tensión en las manos irradia señal nerviosa a hombros y core.
4. **Corte al 20% de Caída de Velocidad:** Si una repetición sube notablemente más lenta que la primera (~20% de desaceleración), **dejá la barra**. Forzar repeticiones agónicas triplica la fatiga central sin aportar más fuerza.

---

## 📈 6. Ondas de Progresión de 4 Semanas

Evitá el estancamiento neural aplicando sobrecarga escalonada:
* **Semana 1 (Acumulación):** Carga base al 100% de la prescripción.
* **Semana 2 (Intensificación):** +2.5% de carga sobre el baseline.
* **Semana 3 (Pico de Fuerza):** +5.0% de carga (máxima estimulación miofibrilar).
* **Semana 4 (Descarga / Deload):** -40% de volumen para recuperación articular y del SNC.

---

## 🛠️ 7. Arquitectura de Software & Resiliencia

* **Frontend:** Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, Lucide Icons.
* **Audio Engine:** Síntesis nativa en navegador con Web Audio API (frecuencias Solfeggio 528 Hz y tonos D5/A5 de alerta).
* **Almacenamiento Local (WAL):** Persistencia en `localStorage` con arquitectura de diario de transacciones para operar 100% offline.
* **Suite de Pruebas:** 97 tests unitarios en Node test runner con cobertura exhaustiva de los motores puros L0.
* **Despliegue:** Vercel Edge Network con CI/CD automatizado desde GitHub.

---

## 🏃 8. Guía Rápida de Entrenamiento (Día a Día en el Gym)

1. Abrí **[atp-strength.vercel.app](https://atp-strength.vercel.app)** en tu celular.
2. Seleccioná tu ciclo de entrenamiento o tocá **CALC FASES** para abrir la cabina universal en cualquier ejercicio libre.
3. Ingresá tu peso de trabajo o hacé el **PR Protocol** de 3 pasos.
4. Activá el metrónomo de tempo 3-1-X-1 para sincronizar la cadencia y tensión excéntrica.
5. Registrá tus repeticiones y RPE tras cada serie: observá el indicador de INOL soviético y las sugerencias de autorregulación.
6. El cronómetro de ATP te avisará mediante sonido y vibración háptica cuando tu fosfocreatina esté al 100% para la siguiente serie.
