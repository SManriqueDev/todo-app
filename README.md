# ToDoApp - Ionic + Angular

Aplicación móvil híbrida para gestión de tareas, construida con Ionic 8 y Angular 20. Incluye un sistema de gamificación (XP y niveles) y usa Firebase Remote Config para habilitar o deshabilitar características, además de ajustar reglas como XP por tarea y límites por nivel sin necesidad de publicar una nueva versión. El proyecto prioriza rendimiento en listas grandes, arquitectura modular y una base mantenible para evolución continua.

## Requisitos Previos

- Node.js 18+
- npm 10+
- Ionic CLI 7+
- Cordova CLI 12+
- Android Studio (para Android)
- Xcode (para iOS, en macOS)

## Pasos de Instalación

1. Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd ToDoApp
```

2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en desarrollo (web):

```bash
npm start
```

## Configuración de Firebase y Remote Config

La app inicializa Firebase al arrancar y consulta Remote Config para controlar comportamientos de gamificación.

1. Configura credenciales de Firebase en ambientes:

- `src/environments/environment.ts` (desarrollo base)
- `src/environments/environment.local.ts` (configuración local)
- `src/environments/environment.prod.ts` (producción)

Debes definir al menos: `apiKey`, `authDomain`, `projectId`, `appId` (y opcionales como `storageBucket`, `messagingSenderId`, `measurementId`).

2. Crea/actualiza parámetros en **Firebase Remote Config**:

- `enable_gamification` (boolean): habilita/deshabilita UI y lógica de gamificación.
- `xp_per_task` (number): XP otorgada al completar tareas.
- `max_xp_per_level` (number): XP máxima por nivel.
- `xp_penalty_on_uncheck` (boolean): aplica penalización al desmarcar tareas.

3. Publica los cambios en Remote Config desde Firebase Console.

4. Ejecuta la app:

```bash
ng serve --configuration local
```

Si no hay configuración válida de Firebase, la app usa valores por defecto para gamificación.

## Pasos para Compilar

### Compilación web

```bash
npm run build
```

Salida: `www/`

### Compilación Android (APK)

```bash
ionic cordova build android
```

APK debug esperado en:
`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Compilación iOS (IPA)

```bash
ionic cordova build ios
```

Luego genera el `.ipa` desde Xcode (Archive/Export) abriendo `platforms/ios`.

## Enlaces de descarga de artefactos

- APK: [Descargar APK](https://drive.google.com/file/d/1UxF1i2vXovR6ul0oCQuLIK_Wl7tMBdPR/view)
- IPA: [Descargar IPA](https://drive.google.com/file/d/1O9DNU8e71DFxubC7KaRBG_ceOlUgI2Zw/view)

## Demo en video (Google Drive)

[![Ver demo ToDoApp](./evidence/demo-image.png)](https://drive.google.com/file/d/1XMhx1Y71cTKhtlqGsXcO18ylZipwsa_B/view)

Video local (evidencia): [`./evidence/demo.mov`](./evidence/demo.mov)

## Prototipo / Diseño (Figma)

[Ver prototipo en Figma](https://www.figma.com/make/PwO4dDN8psjculgRGobO7q/Gamified-To-Do-List-UI?fullscreen=1&t=G1wd60uTLX8RCje9-1)

## Vistas principales (móvil)

### Dashboard

![Vista móvil del dashboard](./evidence/dashboard.png)

### Nueva tarea

![Vista móvil de nueva tarea](./evidence/new-task.png)

### Gestión de categorías

![Vista móvil de gestión de categorías](./evidence/manage-categories.png)

## Respuestas a la prueba técnica

### ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

El reto principal fue integrar Remote Config dentro del flujo de arranque/ciclo de vida de Angular sin afectar la experiencia inicial de la app. También fue clave ajustar Virtual Scroll con datos dinámicos (filtros y cambios de estado) para mantener fluidez con volúmenes altos de tareas.

### ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

Se aplicó Virtual Scroll para renderizar solo elementos visibles y reducir costo de DOM. Se usó Lazy Loading con `loadComponent` para disminuir carga inicial. Se configuró `OnPush Change Detection` para limitar renders innecesarios. Además, se cuidó la gestión de Observables (desuscripción cuando aplica) para evitar fugas de memoria y degradación en sesiones largas.

### ¿Cómo aseguraste la calidad y mantenibilidad del código?

La arquitectura separa responsabilidades mediante servicios especializados (SRP), modelos tipados con interfaces TypeScript y organización modular por features. Esto facilita pruebas, cambios evolutivos y escalabilidad sin acoplamientos fuertes.
