# ATP Strength

Aplicación para una sesión de fuerza. La puerta, el ejercicio, el PR y las series viven en el navegador. Las marcas quedan en el dispositivo.

Sitio: [https://atp-strength.vercel.app](https://atp-strength.vercel.app)

## Una sesión

1. **Puerta.** La forja abre la sesión. El himno no suena hasta que la persona toca «Poner el himno». «ENTRAR AL TEMPLO» pasa al ejercicio.
2. **Ejercicio y PR.** La pantalla dice «Ingresa el ejercicio que vas a realizar y tu PR.» El nombre se escribe: no está limitado al catálogo. Si ese ejercicio ya tiene un PR guardado en el dispositivo, se muestra y se puede cambiar.
3. **Ayuda para el PR.** «Ayudar a sacar el PR» pide un peso y unas repeticiones. Estima el PR con la fórmula que la app ya usa al guardar una marca (Epley: peso × (1 + repeticiones / 30); una repetición deja el peso tal cual) y escribe el número en el campo.
4. **Fases.** Confirmar guarda el ejercicio y el PR en el dispositivo y arma el protocolo que ya existía, trabajando al 90 % de ese PR. Lo primero después de ese paso son las series.
5. **Descanso.** Cada serie abre un solo reloj: «Listo», pausa y «+30 s». Al pausar, el reloj sigue en pantalla.
6. **Voz.** Un control, «Voz» o «Voz en silencio», prende o apaga la voz del coach. En el perfil, «Voz del coach» es el mismo ajuste.
7. **Progreso.** Si el servidor no se puede leer, la pantalla lo dice. No presenta esa falla como si no hubiera marcas. Lo guardado en el dispositivo sigue ahí.

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
