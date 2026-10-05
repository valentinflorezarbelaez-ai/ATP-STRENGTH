# ATP Strength

Aplicación para una sesión de fuerza. La puerta, el ejercicio, el PR y las series viven en el navegador. Las marcas se guardan en el dispositivo.

Sitio: [https://atp-strength.vercel.app](https://atp-strength.vercel.app)

## Una sesión

1. **Puerta.** La forja abre la sesión. El himno permanece en silencio, y el archivo no se pide, hasta que la persona toca «Poner el himno». Sobre «ENTRAR AL TEMPLO» está la línea: «El estándar son los más fuertes que vivieron: Eddie Hall, Brian Shaw, Žydrūnas Savickas, Hafþór Björnsson, Mark Felix, Louis Cyr y los demás.» Ese botón pasa al ejercicio.

2. **Ejercicio y PR.** La pantalla dice «Ingresa el ejercicio que vas a realizar y tu PR.» Debajo repite la misma línea. El nombre se escribe: no está limitado al catálogo. Si ese ejercicio ya tiene un PR guardado en el dispositivo, aparece «Ya tenés un PR de {n} kg en este dispositivo. Podés cambiarlo.» y el número se puede editar.

3. **Ayuda para el PR.** «Ayudar a sacar el PR» pide un peso y unas repeticiones. «Poner este PR» estima el número con la fórmula que usa el código para una marca (`computeOneRm`, Epley por defecto): peso × (1 + repeticiones / 30), redondeado a un decimal. Con una repetición, el resultado es el peso, también a un decimal. Ese número se escribe en el campo del PR.

4. **Fases.** «Confirmar» guarda ese número en el dispositivo como el PR de la sesión, sin volver a estimarlo. Las fases trabajan al 90 % de ese PR. Lo primero después de confirmar son las series.

5. **Descanso.** Cada serie abre un solo reloj, «Descanso», y oculta las series mientras está en pantalla. Los controles son «Listo», «Pausar» o «Seguir», y «+30 s». Al pausar, el reloj sigue visible.

6. **Voz.** En las series hay un solo control: «Voz» o «Voz en silencio». En el perfil, «Voz del coach» es el mismo ajuste y muestra «Activada» o «Silencio».

7. **Progreso.** Si el servidor no se puede leer, la pantalla dice «No se pudieron leer las marcas.» Si además hay marcas en el dispositivo, dice «No se pudieron leer las marcas. Estas son las de este dispositivo.» Esa falla no se presenta como si no hubiera marcas.

En la sesión, el oro queda en la acción principal: «ENTRAR AL TEMPLO», «Confirmar» y «Listo». Los demás controles de ese recorrido van en zinc.

El modo pro usa el título «Sesión de fuerza». La guía, la calculadora y el perfil siguen en la sesión.

## Cómo correr el frontend

Hace falta Node.js. Desde la raíz del repositorio:

```bash
cd atp-strength-frontend
npm install
npm run dev
```

La app queda en [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

`npm run lint` tiene que terminar sin errores ni avisos. `npm run build` compila con Turbopack.

Sin `NEXT_PUBLIC_API_URL`, el cliente intenta `http://localhost:8000`. Si ese servidor no responde, la sesión igual funciona con las marcas de este dispositivo.

## Licencia

MIT. Ver [LICENSE](LICENSE).

Valentín Flórez Arbeláez.
