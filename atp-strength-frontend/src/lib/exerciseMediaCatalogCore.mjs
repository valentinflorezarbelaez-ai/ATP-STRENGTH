/**
 * Exercise Media Catalog & Biomechanical Cues (SSOT)
 * Comprehensive technical video demonstrations for all 25 trackable exercises in ATP Strength.
 * Every exercise has its own verified, authoritative, unique video demonstration.
 */

export const EXERCISE_MEDIA_CATALOG = {
  "sentadilla trasera": {
    "id": "squat_back",
    "name": "Sentadilla Trasera",
    "category": "Sentadilla",
    "targetMuscles": [
      "Cuádriceps",
      "Glúteo Mayor",
      "Erector Espinal",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=ultWZbUMPL8",
    "youtubeId": "ultWZbUMPL8",
    "posterUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Apoyo trípode firme con los pies al ancho de hombros y puntas ligeramente abiertas.",
      "Inspiración diafragmática profunda 360° y maniobra de Valsalva antes de iniciar el descenso.",
      "Control excéntrico bajando hasta que la cadera rompa el paralelo de las rodillas.",
      "Empuje concéntrico explosivo manteniendo el pecho orgulloso y rodillas alineadas con los pies."
    ],
    "commonMistakes": [
      "Colapso de rodillas en valgo durante la fase concéntrica.",
      "Pérdida de rigidez en la columna lumbar (butt-wink excesivo) en el punto más profundo."
    ],
    "tempo": "3-1-X-1"
  },
  "press de banca": {
    "id": "bench_press",
    "name": "Press de Banca Plano",
    "category": "Banca",
    "targetMuscles": [
      "Pectoral Mayor",
      "Tríceps Braquial",
      "Deltoides Anterior",
      "Dorsal Ancho"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=wzq57DB5Ppg",
    "youtubeId": "wzq57DB5Ppg",
    "posterUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Retracción y depresión escapular estricta clavando los omóplatos en el banco.",
      "Leg drive constante con las plantas de los pies bien pegadas al suelo.",
      "Descenso controlado llevando la barra a la línea media del esternón (ángulo de codos ~45-75°).",
      "Pausa sólida sin rebote en el pecho y extensión concéntrica potente."
    ],
    "commonMistakes": [
      "Codos excesivamente abiertos a 90° generando estrés nocivo en el manguito rotador.",
      "Despegar los glúteos del banco para forzar repeticiones."
    ],
    "tempo": "2-1-X-1"
  },
  "peso muerto convencional": {
    "id": "deadlift_conv",
    "name": "Peso Muerto Convencional",
    "category": "Peso Muerto",
    "targetMuscles": [
      "Isquiosurales",
      "Glúteo Mayor",
      "Dorsales",
      "Erectores Espinales",
      "Antebrazo"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=1nvAUJVmFZY",
    "youtubeId": "1nvAUJVmFZY",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Barra pegada a la mitad del pie (1 pulgada de la espinilla) con agarre por fuera de las piernas.",
      "Bisagra de cadera hasta sujetar la barra sin moverla de su posición.",
      "Espalda neutra apretando los dorsales como si exprimieras naranjas en las axilas.",
      "Extensión simultánea de rodilla y cadera empujando el suelo con los talones."
    ],
    "commonMistakes": [
      "Redondear la columna lumbar al despegar la barra del suelo.",
      "Alejar la barra del cuerpo aumentando la palanca sobre la espalda baja."
    ],
    "tempo": "1-1-X-1"
  },
  "press militar": {
    "id": "overhead_press",
    "name": "Press Militar de Pie",
    "category": "Militar",
    "targetMuscles": [
      "Deltoides",
      "Tríceps",
      "Trapecio Superior",
      "Core y Glúteos"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=5yWaNOvgFCM",
    "youtubeId": "5yWaNOvgFCM",
    "posterUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Agarre apenas por fuera de los hombros con muñecas rectas sobre los antebrazos.",
      "Glúteos y cuádriceps apretados al 100% creando una base de soporte rígida como una columna de concreto.",
      "Trayectoria vertical recta de la barra, esquivando la cabeza hacia atrás brevemente.",
      "Bloqueo firme con la barra centrada directamente sobre la coronilla y escápulas encogidas arriba."
    ],
    "commonMistakes": [
      "Hiperextensión lumbar excesiva inclinando el torso hacia atrás.",
      "Flexionar las rodillas para rebotar en un movimiento estricto."
    ],
    "tempo": "2-0-X-1"
  },
  "dominadas lastradas": {
    "id": "pullups_weighted",
    "name": "Dominadas con Lastre / Estrictas",
    "category": "Tracción",
    "targetMuscles": [
      "Dorsal Ancho",
      "Bíceps Braquial",
      "Braquiorradial",
      "Redondo Mayor"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    "youtubeId": "eGo4IYlbE5g",
    "posterUrl": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Comenzar desde suspensión muerta con codos bloqueados y escápulas activas.",
      "Traccionar llevando el pecho hacia la barra en lugar de simplemente pasar la barbilla.",
      "Codos apuntando hacia los bolsillos laterales en un tirón continuo sin balanceo (kipping).",
      "Descenso controlado resistiendo la gravedad en todo el rango articular."
    ],
    "commonMistakes": [
      "Usar impulso con patadas de piernas perdiendo la tensión pura del dorsal.",
      "Rango de movimiento incompleto sin descender hasta la elongación completa."
    ],
    "tempo": "2-1-X-1"
  },
  "fondos en paralelas": {
    "id": "dips_weighted",
    "name": "Fondos en Paralelas",
    "category": "Empuje",
    "targetMuscles": [
      "Pectoral Inferior",
      "Tríceps",
      "Deltoides Anterior"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=2z8JmcrW-As",
    "youtubeId": "2z8JmcrW-As",
    "posterUrl": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Depresión escapular firme manteniendo los hombros lejos de las orejas.",
      "Ligera inclinación del torso hacia adelante para activar el pectoral.",
      "Descenso hasta que el codo alcance un ángulo de 90° sin comprometer la cápsula del hombro.",
      "Empuje potente extendiendo codos sin hiperextensión brusca."
    ],
    "commonMistakes": [
      "Dejar que los hombros rueden hacia adelante en el fondo del movimiento.",
      "Rebote elástico sin control excéntrico."
    ],
    "tempo": "2-1-X-1"
  },
  "remo pendlay": {
    "id": "pendlay_row",
    "name": "Remo Pendlay",
    "category": "Tracción",
    "targetMuscles": [
      "Dorsal Ancho",
      "Romboides",
      "Trapecio Medio",
      "Erectores Espinales"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=C_p-s66KBpg",
    "youtubeId": "C_p-s66KBpg",
    "posterUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Torso completamente paralelo al suelo en cada repetición partiendo del piso muerto.",
      "Tirón explosivo llevando la barra hacia el esternón inferior/abdomen superior.",
      "Bloqueo estricto de la espalda baja sin elevar el torso durante el tirón.",
      "Regresar la barra al suelo con control y reiniciar la inercia a cero."
    ],
    "commonMistakes": [
      "Elevar el torso a 45° convirtiéndolo en un remo Yates tramposo.",
      "Usar impulso de piernas para despegar la barra del suelo."
    ],
    "tempo": "1-0-X-1"
  },
  "peso muerto rumano": {
    "id": "romanian_deadlift",
    "name": "Peso Muerto Rumano (RDL)",
    "category": "Cadena Posterior",
    "targetMuscles": [
      "Isquiosurales",
      "Glúteo Mayor",
      "Erectores Espinales"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=GZAKFRNtxLY",
    "youtubeId": "GZAKFRNtxLY",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Iniciar desde arriba; flexionar ligeramente las rodillas y bloquear ese ángulo.",
      "Empujar la cadera hacia atrás hacia la pared trasera sintiendo tensión en los isquios.",
      "Mantener la barra rozando los muslos y tibias en todo el recorrido.",
      "Bajar solo hasta donde la cadera deje de viajar hacia atrás sin curvar la columna."
    ],
    "commonMistakes": [
      "Convertirlo en una sentadilla flexionando excesivamente las rodillas.",
      "Redondear la espalda baja para intentar que los discos toquen el suelo."
    ],
    "tempo": "3-1-1-0"
  },
  "paseo del granjero pesado": {
    "id": "farmers_walk",
    "name": "Paseo del Granjero Pesado",
    "category": "Acarreo & Agarre",
    "targetMuscles": [
      "Trapecios",
      "Antebrazos",
      "Core Anti-flexión Lateral",
      "Glúteo Medio"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=wtHHiJecbQg",
    "youtubeId": "wtHHiJecbQg",
    "posterUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Despegue inicial como un peso muerto perfecto con columna totalmente neutra.",
      "Retracción y elevación neutra de hombros; no permitir que el peso tire hacia abajo.",
      "Pasos cortos, rápidos y precisos apoyando talón a punta con cadencia firme.",
      "Core 100% contraído evitando cualquier bamboleo o balanceo lateral del torso."
    ],
    "commonMistakes": [
      "Inclinarse hacia los lados o hacia adelante perdiendo la verticalidad.",
      "Dar zancadas demasiado largas perdiendo estabilidad en la pelvis."
    ],
    "tempo": "Paso controlado"
  },
  "planchas isométricas pesadas": {
    "id": "heavy_plank",
    "name": "Planchas Isométricas Pesadas / RKC",
    "category": "Core",
    "targetMuscles": [
      "Recto Abdominal",
      "Transverso del Abdomen",
      "Glúteos",
      "Serrato"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=M0u5sm9Xcv4",
    "youtubeId": "M0u5sm9Xcv4",
    "posterUrl": "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Apoyo en antebrazos con codos directamente debajo de los hombros.",
      "Tracción activa isométrica de codos hacia los pies y pies hacia los codos.",
      "Contracción máxima de glúteos y retroversión pélvica para activar el transverso.",
      "Tensión máxima de cuerpo entero durante series cortas de alta intensidad."
    ],
    "commonMistakes": [
      "Dejar caer la cadera en anteversión estresando las vértebras lumbares.",
      "Elevar los glúteos hacia arriba reduciendo el trabajo de la pared abdominal."
    ],
    "tempo": "Isométrico Máximo"
  },
  "sentadilla trasera técnica": {
    "id": "pause_squat",
    "name": "Sentadilla Trasera Técnica (con Pausa)",
    "category": "Sentadilla",
    "targetMuscles": [
      "Cuádriceps",
      "Glúteos",
      "Aductores",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=MvZsHEroKPE",
    "youtubeId": "MvZsHEroKPE",
    "posterUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Descenso controlado en 3 segundos manteniendo la rigidez del torso.",
      "Pausa absoluta de 2 segundos en el punto más profundo (el hoyo) sin relajar la tensión.",
      "Cero rebote elástico: la salida debe ser generada 100% por fuerza neuromuscular concéntrica pura.",
      "Mantener la mirada al frente y el pecho erguido durante toda la transición."
    ],
    "commonMistakes": [
      "Relajar los músculos o el abdomen en el fondo de la sentadilla.",
      "Contar una pausa de medio segundo en lugar de 2 segundos completos y estricto estatismo."
    ],
    "tempo": "3-2-X-1"
  },
  "curl bíceps barra z": {
    "id": "ez_bar_curl",
    "name": "Curl Bíceps Barra Z",
    "category": "Brazos",
    "targetMuscles": [
      "Bíceps Braquial",
      "Braquial Anterior",
      "Braquiorradial"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=sOcM7gcnQC0",
    "youtubeId": "sOcM7gcnQC0",
    "posterUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Agarre en los ángulos de la barra Z que alinean la muñeca de forma anatómica y segura.",
      "Codos pegados a los costados y ligeramente por delante del plano del torso.",
      "Flexión concéntrica sin balanceo ni arqueo de espalda.",
      "Extensión excéntrica lenta sintiendo la contracción en la elongación del bíceps."
    ],
    "commonMistakes": [
      "Balancear la cadera y hombros para elevar el peso.",
      "Despegar los codos hacia atrás en la fase concéntrica."
    ],
    "tempo": "3-0-1-1"
  },
  "elevaciones piernas a la barra": {
    "id": "toes_to_bar",
    "name": "Elevaciones de Piernas a la Barra",
    "category": "Core Dinámico",
    "targetMuscles": [
      "Recto Abdominal",
      "Flexores de Cadera",
      "Dorsales",
      "Agarre"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=1QeII_BfQps",
    "youtubeId": "1QeII_BfQps",
    "posterUrl": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Comenzar colgado en posición hollow con escápulas activas.",
      "Comprimir el abdomen y elevar las piernas rectas hacia la barra sin balanceo.",
      "Tocar la barra con las puntas de los pies de forma controlada.",
      "Descenso resistido manteniendo la tensión abdominal sin hiperextender la espalda."
    ],
    "commonMistakes": [
      "Kipping o balanceo incontrolado usando inercia en lugar de fuerza abdominal.",
      "Dejar caer las piernas bruscamente en la fase excéntrica."
    ],
    "tempo": "2-0-X-1"
  },
  "power clean (cargada de potencia)": {
    "id": "power_clean",
    "name": "Power Clean (Cargada de Potencia)",
    "category": "Halterofilia",
    "targetMuscles": [
      "Glúteos",
      "Isquiosurales",
      "Cuádriceps",
      "Trapecios",
      "Deltoides"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=YG8M_-11C2A",
    "youtubeId": "YG8M_-11C2A",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Primer tirón controlado desde el suelo manteniendo el ángulo del torso.",
      "Segundo tirón explosivo con triple extensión (tobillos, rodillas, cadera) al pasar las rodillas.",
      "Encogimiento de hombros violento manteniendo la barra pegada a la camiseta.",
      "Rotación rápida de codos hacia arriba y recepción sólida por encima del paralelo (cuarto de sentadilla)."
    ],
    "commonMistakes": [
      "Tirar con los brazos flexionados antes de completar la triple extensión.",
      "Abrir los pies excesivamente en la recepción perdiendo la base de soporte."
    ],
    "tempo": "Explosivo"
  },
  "hang power clean (cargada colgada)": {
    "id": "hang_power_clean",
    "name": "Hang Power Clean (Cargada Colgada)",
    "category": "Halterofilia",
    "targetMuscles": [
      "Glúteos",
      "Cadena Posterior",
      "Trapecios",
      "Erectores Espinales"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=efHjodEVf9w",
    "youtubeId": "efHjodEVf9w",
    "posterUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Iniciar desde la posición de colgado (justo arriba o a la altura de las rodillas).",
      "Bisagra de cadera con hombros ligeramente por delante de la barra.",
      "Extensión violenta de cadera hacia arriba acelerando la barra verticalmente.",
      "Recepción reactiva en front rack con codos altos y base firme."
    ],
    "commonMistakes": [
      "Bajar en sentadilla en lugar de hacer bisagra para cargar los isquios.",
      "Lentitud en la rotación de codos recibiendo la barra en las muñecas."
    ],
    "tempo": "Explosivo"
  },
  "power snatch (arrancada de potencia)": {
    "id": "power_snatch",
    "name": "Power Snatch (Arrancada de Potencia)",
    "category": "Halterofilia",
    "targetMuscles": [
      "Cadena Posterior Completa",
      "Hombros",
      "Trapecios",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=1Lv1IyigIUY",
    "youtubeId": "1Lv1IyigIUY",
    "posterUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Agarre ancho con hook grip (agarre de gancho) y pecho erguido sobre la barra.",
      "Aceleración progresiva desde el suelo hasta el punto de contacto en la cadera.",
      "Triple extensión explosiva catapultando la barra hacia arriba en línea recta.",
      "Recepción agresiva por encima de los 90° con codos completamente bloqueados sobre la cabeza."
    ],
    "commonMistakes": [
      "Golpear la barra hacia adelante con la cadera alejándola del cuerpo.",
      "Blandura en el bloqueo de codos en la recepción overhead."
    ],
    "tempo": "Explosivo"
  },
  "hang power snatch (arrancada colgada)": {
    "id": "hang_power_snatch",
    "name": "Hang Power Snatch (Arrancada Colgada)",
    "category": "Halterofilia",
    "targetMuscles": [
      "Glúteos",
      "Isquiosurales",
      "Trapecios",
      "Estabilizadores Overhead"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=ydHHsju1-Nc",
    "youtubeId": "ydHHsju1-Nc",
    "posterUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Deslizar la barra por los muslos hasta la posición de colgado con torso firme.",
      "Máxima velocidad de extensión de cadera desde el bolsillo articular.",
      "Tirón alto de codos manteniendo la barra ceñida al cuerpo.",
      "Golpe de pies y bloqueo firme overhead con escápulas empujando hacia arriba."
    ],
    "commonMistakes": [
      "Iniciar el tirón con los brazos doblados.",
      "No completar la extensión de la cadera por apurar la recepción."
    ],
    "tempo": "Explosivo"
  },
  "push press (press de empuje)": {
    "id": "push_press",
    "name": "Push Press (Press de Empuje)",
    "category": "Potencia / Empuje",
    "targetMuscles": [
      "Deltoides",
      "Tríceps",
      "Cuádriceps",
      "Glúteos",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=yklSQG1_Ovc",
    "youtubeId": "yklSQG1_Ovc",
    "posterUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Barra apoyada sólidamente sobre los deltoides anteriores (front rack posicional).",
      "Dip vertical corto y controlado de 5 a 10 cm con el torso completamente recto.",
      "Drive explosivo de piernas transfiriendo la energía del suelo a la barra.",
      "Terminar con empuje potente de brazos hasta el bloqueo total sobre la cabeza."
    ],
    "commonMistakes": [
      "Inclinarse hacia adelante en el dip perdiendo la verticalidad del empuje.",
      "Recepcionar flexionando las rodillas de nuevo (convirtiéndolo en jerk)."
    ],
    "tempo": "1-0-X-1"
  },
  "power jerk (envión de potencia)": {
    "id": "power_jerk",
    "name": "Power Jerk (Envión de Potencia)",
    "category": "Halterofilia",
    "targetMuscles": [
      "Hombros",
      "Tríceps",
      "Cuádriceps",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=Ir_34nxrk1Q",
    "youtubeId": "Ir_34nxrk1Q",
    "posterUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Dip vertical idéntico al push press manteniendo el torso perpendicular al piso.",
      "Drive concéntrico explosivo de cuádriceps proyectando la barra hacia arriba.",
      "Segundo dip rápido recepcionando la barra con flexión de rodillas y codos bloqueados a la vez.",
      "Ponerse de pie completando la extensión con la barra dominada overhead."
    ],
    "commonMistakes": [
      "Empujar con los brazos antes de que las piernas completen el impulso.",
      "Falta de agresividad en el bloqueo de codos en la recepción."
    ],
    "tempo": "Explosivo"
  },
  "clean high pull (tirón alto de cargada)": {
    "id": "clean_high_pull",
    "name": "Clean High Pull (Tirón Alto de Cargada)",
    "category": "Potencia Balística",
    "targetMuscles": [
      "Trapecios",
      "Cadena Posterior",
      "Cuádriceps",
      "Deltoides Posterior"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=2Qv8pEnprpU",
    "youtubeId": "2Qv8pEnprpU",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Ejecución del primer y segundo tirón con idéntica técnica al clean de competición.",
      "Triple extensión violenta catapultando el cuerpo sobre la punta de los pies.",
      "Encogimiento de trapecios seguido de tirón con codos altos apuntando al techo.",
      "Permitir que la barra caiga con control guiado al suelo sin atraparla."
    ],
    "commonMistakes": [
      "Tirar con los codos hacia atrás en lugar de hacia arriba y hacia afuera.",
      "Cortar la extensión de la cadera por empezar a tirar con los brazos antes de tiempo."
    ],
    "tempo": "Explosivo"
  },
  "snatch high pull (tirón alto de arrancada)": {
    "id": "snatch_high_pull",
    "name": "Snatch High Pull (Tirón Alto de Arrancada)",
    "category": "Potencia Balística",
    "targetMuscles": [
      "Cadena Posterior",
      "Trapecio Superior y Medio",
      "Glúteos"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=9WRp0a5hcb0",
    "youtubeId": "9WRp0a5hcb0",
    "posterUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Agarre ancho de snatch asegurando la barra pegada a los muslos durante el recorrido.",
      "Extensión masiva de cadera y rodillas al unísono proyectando la barra vertical.",
      "Codos altos por encima de las muñecas dirigiendo la trayectoria recta de la barra.",
      "Pies se mantienen firmes transmitiendo toda la potencia contra la plataforma."
    ],
    "commonMistakes": [
      "Golpear la barra horizontalmente haciendo que describa una curva hacia afuera.",
      "No elevar los codos dejando que la barra baje prematuramente."
    ],
    "tempo": "Explosivo"
  },
  "sentadilla con salto con barra (barbell jump squat)": {
    "id": "barbell_jump_squat",
    "name": "Sentadilla con Salto con Barra",
    "category": "Potencia / Pliometría",
    "targetMuscles": [
      "Cuádriceps",
      "Glúteos",
      "Gemelos",
      "Core"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=z7GAKBpGzws",
    "youtubeId": "z7GAKBpGzws",
    "posterUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Carga ligera (20-30% de 1RM) asegurando la barra firmemente pegada a los trapecios.",
      "Descenso controlado a un cuarto o media sentadilla cargando la musculatura como un resorte.",
      "Triple extensión explosiva despegando del suelo con máxima intención vertical.",
      "Recepción suave amortiguando con flexión coordinada de tobillos, rodillas y cadera."
    ],
    "commonMistakes": [
      "Usar peso excesivo que impida la aceleración vertical real.",
      "Aterrizar con rodillas rígidas o en valgo provocando impacto articular."
    ],
    "tempo": "1-0-X-0"
  },
  "salto con trap bar (trap bar jump)": {
    "id": "trap_bar_jump",
    "name": "Salto con Trap Bar (Trap Bar Jump)",
    "category": "Potencia / Salto",
    "targetMuscles": [
      "Glúteos",
      "Cuádriceps",
      "Erectores Espinales",
      "Agarre"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=I-Zm8g6kXIM",
    "youtubeId": "I-Zm8g6kXIM",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Posición centrada en la Trap Bar con agarre neutro firme y brazos extendidos.",
      "Descenso rápido a cuarto de sentadilla manteniendo la columna perfectamente neutra.",
      "Salto vertical con máxima fuerza y velocidad intentando tocar el techo.",
      "Aterrizaje en el mismo punto exacto absorbiendo el impacto con control neuromuscular."
    ],
    "commonMistakes": [
      "Permitir que la barra se balancee o golpee las piernas al despegar o aterrizar.",
      "Perder la tensión escapular dejando que los brazos se relajen en el aire."
    ],
    "tempo": "1-0-X-0"
  },
  "peso muerto con déficit (deficit deadlift)": {
    "id": "deficit_deadlift",
    "name": "Peso Muerto con Déficit",
    "category": "Peso Muerto Especial",
    "targetMuscles": [
      "Cuádriceps",
      "Glúteo Mayor",
      "Isquiosurales",
      "Erectores Espinales"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=CpWsUsqBtN8",
    "youtubeId": "CpWsUsqBtN8",
    "posterUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Parado sobre una plataforma o disco de 2 a 5 cm aumentando el recorrido del tirón.",
      "Flexión de rodillas ligeramente mayor para alcanzar la barra manteniendo la columna neutra.",
      "Empuje brutal del suelo con los cuádriceps para superar el despegue inicial comprometido.",
      "Mantener la barra pegada a las piernas para evitar palancas desfavorables sobre la espalda baja."
    ],
    "commonMistakes": [
      "Usar un déficit demasiado alto que obligue a arquear peligrosamente la zona lumbar.",
      "Subir la cadera primero dejando que la espalda absorba todo el peso del tirón."
    ],
    "tempo": "1-1-X-1"
  },
  "peso muerto agarre arrancada (snatch grip deadlift)": {
    "id": "snatch_grip_deadlift",
    "name": "Peso Muerto Agarre Arrancada",
    "category": "Peso Muerto Especial",
    "targetMuscles": [
      "Espalda Alta Completa",
      "Dorsales",
      "Glúteos",
      "Isquiosurales"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=mp9gtX-JqB0",
    "youtubeId": "mp9gtX-JqB0",
    "posterUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    "formCues": [
      "Agarre extra ancho en los anillos de la barra obligando a bajar más la cadera al inicio.",
      "Pecho abierto con retracción escapular y mirada hacia el frente.",
      "Apretón dorsal máximo para evitar que la barra se despegue de las piernas.",
      "Rango de movimiento ampliado exigiendo el doble de trabajo a los isquios y espalda alta."
    ],
    "commonMistakes": [
      "Perder la tensión escapular dejando que los hombros roten hacia adelante.",
      "Usar un agarre sin correas si el agarre se fatiga antes que la cadena posterior."
    ],
    "tempo": "2-1-X-1"
  }
};

export function getExerciseMedia(rawName) {
  if (!rawName) return getFallbackMedia("Ejercicio de Fuerza");

  const clean = rawName.toLowerCase().trim();

  // 1. Direct hit in 25 primary catalog keys
  if (EXERCISE_MEDIA_CATALOG[clean]) {
    return EXERCISE_MEDIA_CATALOG[clean];
  }

  // 2. Direct hit by ID
  for (const media of Object.values(EXERCISE_MEDIA_CATALOG)) {
    if (clean === media.id.toLowerCase()) {
      return media;
    }
  }

  // 3. High-precision keyword resolvers (Specific before general to avoid misclassification)
  // Bench / Pecho / Empuje horizontal
  if (clean.includes("banca") || clean.includes("bench") || clean.includes("pecho") || clean.includes("chest press")) {
    return EXERCISE_MEDIA_CATALOG["press de banca"];
  }

  // Squats / Sentadillas
  if (clean.includes("sentadilla") || clean.includes("squat")) {
    if (clean.includes("técnica") || clean.includes("tecnica") || clean.includes("pausa") || clean.includes("pause")) {
      return EXERCISE_MEDIA_CATALOG["sentadilla trasera técnica"];
    }
    if (clean.includes("salto") || clean.includes("jump")) {
      return EXERCISE_MEDIA_CATALOG["sentadilla con salto con barra (barbell jump squat)"];
    }
    return EXERCISE_MEDIA_CATALOG["sentadilla trasera"];
  }

  // Deadlifts / Peso Muerto
  if (clean.includes("muerto") || clean.includes("deadlift") || clean.includes("rdl")) {
    if (clean.includes("arrancada") || clean.includes("snatch")) {
      return EXERCISE_MEDIA_CATALOG["peso muerto agarre arrancada (snatch grip deadlift)"];
    }
    if (clean.includes("déficit") || clean.includes("deficit")) {
      return EXERCISE_MEDIA_CATALOG["peso muerto con déficit (deficit deadlift)"];
    }
    if (clean.includes("rumano") || clean.includes("romanian") || clean.includes("rdl")) {
      return EXERCISE_MEDIA_CATALOG["peso muerto rumano"];
    }
    return EXERCISE_MEDIA_CATALOG["peso muerto convencional"];
  }

  // Overhead & Push Press
  if (clean.includes("push press")) return EXERCISE_MEDIA_CATALOG["push press (press de empuje)"];
  if (clean.includes("militar") || clean.includes("overhead") || clean.includes("ohp") || clean.includes("hombro")) {
    return EXERCISE_MEDIA_CATALOG["press militar"];
  }

  // Olympic Lifts
  if (clean.includes("clean") || clean.includes("cargada")) {
    if (clean.includes("hang") || clean.includes("colgada")) {
      return EXERCISE_MEDIA_CATALOG["hang power clean (cargada colgada)"];
    }
    if (clean.includes("pull") || clean.includes("tirón") || clean.includes("tiron")) {
      return EXERCISE_MEDIA_CATALOG["clean high pull (tirón alto de cargada)"];
    }
    return EXERCISE_MEDIA_CATALOG["power clean (cargada de potencia)"];
  }

  if (clean.includes("snatch") || clean.includes("arrancada")) {
    if (clean.includes("hang") || clean.includes("colgada")) {
      return EXERCISE_MEDIA_CATALOG["hang power snatch (arrancada colgada)"];
    }
    if (clean.includes("pull") || clean.includes("tirón") || clean.includes("tiron")) {
      return EXERCISE_MEDIA_CATALOG["snatch high pull (tirón alto de arrancada)"];
    }
    return EXERCISE_MEDIA_CATALOG["power snatch (arrancada de potencia)"];
  }

  if (clean.includes("jerk") || clean.includes("envión") || clean.includes("envion")) {
    return EXERCISE_MEDIA_CATALOG["power jerk (envión de potencia)"];
  }

  // Jumps
  if ((clean.includes("salto") || clean.includes("jump")) && (clean.includes("trap") || clean.includes("trampa"))) {
    return EXERCISE_MEDIA_CATALOG["salto con trap bar (trap bar jump)"];
  }

  // Pull / Calisthenics / Accessories
  if (clean.includes("dominada") || clean.includes("pullup") || clean.includes("pull-up") || clean.includes("chinup") || clean.includes("chin-up")) {
    return EXERCISE_MEDIA_CATALOG["dominadas lastradas"];
  }
  if (clean.includes("fondo") || clean.includes("dip") || clean.includes("paralela")) {
    return EXERCISE_MEDIA_CATALOG["fondos en paralelas"];
  }
  if (clean.includes("remo") || clean.includes("row") || clean.includes("pendlay")) {
    return EXERCISE_MEDIA_CATALOG["remo pendlay"];
  }
  if (clean.includes("curl") || clean.includes("bicep") || clean.includes("bíceps") || clean.includes("biceps")) {
    return EXERCISE_MEDIA_CATALOG["curl bíceps barra z"];
  }
  if (clean.includes("pierna") || clean.includes("leg raise") || clean.includes("leg-raise") || clean.includes("toes to bar")) {
    return EXERCISE_MEDIA_CATALOG["elevaciones piernas a la barra"];
  }
  if (clean.includes("granjero") || clean.includes("farmer") || clean.includes("carry")) {
    return EXERCISE_MEDIA_CATALOG["paseo del granjero pesado"];
  }
  if (clean.includes("plancha") || clean.includes("plank") || clean.includes("core") || clean.includes("abs") || clean.includes("isométrica") || clean.includes("isometrica")) {
    return EXERCISE_MEDIA_CATALOG["planchas isométricas pesadas"];
  }

  // 4. Safe substring fallback
  for (const [key, media] of Object.entries(EXERCISE_MEDIA_CATALOG)) {
    if (clean.includes(key) || (clean.length > 5 && key.includes(clean))) {
      return media;
    }
  }

  return getFallbackMedia(rawName);
}

function getFallbackMedia(name) {
  return {
    id: "fallback_exercise",
    name,
    category: "Accesorios",
    targetMuscles: ["Músculos Primarios", "Estabilizadores del Core"],
    videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    youtubeId: "ultWZbUMPL8",
    posterUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Alineación postural estricta antes de aplicar tensión neuromuscular.",
      "Control excéntrico deliberado sin perder compactación articular.",
      "Cadencia concéntrica con máximo esfuerzo de intención explosiva.",
      "Respiración diafragmática coordinada con la fase del movimiento."
    ],
    commonMistakes: [
      "Sacrificar el rango de movimiento por cargar peso excesivo.",
      "Perder la estabilidad del core durante las repeticiones finales."
    ],
    tempo: "2-0-X-1"
  };
}
