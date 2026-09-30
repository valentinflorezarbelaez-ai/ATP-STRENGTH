# Política de Seguridad

## Versiones Soportadas

| Versión | Estado de Soporte   |
| :------ | :------------------ |
| 1.x.x   | :white_check_mark:  |
| < 1.0.0 | :x:                 |

## Reporte Responsable de Vulnerabilidades

El equipo de ingeniería de ATP-STRENGTH se toma con la máxima seriedad la seguridad y la privacidad de los datos de cada atleta.

Si creés haber detectado una vulnerabilidad o fallo de seguridad en el código base, te solicitamos **NO** abrir un issue público. Por favor, reportalo de forma responsable:

1. Enviá un correo a `security@atp-strength.internal` o contactá al propietario del repositorio mediante el canal privado de reportes de seguridad de GitHub.
2. Adjuntá una prueba de concepto (PoC) detallada y los pasos reproducibles.
3. El equipo dará acuse de recibo y coordinará la mitigación dentro de las primeras 48 horas.

## Arquitectura de Privacidad y Seguridad Local-First

ATP-STRENGTH opera bajo una estricta política de **cero telemetría y procesamiento local**:
- Todas las sesiones, series, cargas y marcas neuromusculares se almacenan exclusivamente en el dispositivo del atleta a través de un motor Write-Ahead Logging (WAL) offline.
- Cada entrada se valida mediante sumas de comprobación criptográficas (estándar `djb2`) antes de su persistencia.
- No se incorporan balizas de rastreo, píxeles de analítica ni cookies de identificación de usuarios.
