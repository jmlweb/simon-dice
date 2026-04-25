# 🎮 Simón Dice

> **El clásico juego de eliminación para grupos — ahora en tu navegador, con voz.**

Simón Dice es una versión digital del juego de toda la vida, diseñada para partidas en grupo. Con reconocimiento de voz en **6 idiomas**, efectos de sonido generados en tiempo real y una interfaz limpia pensada para móvil, es el entretenimiento perfecto para reuniones, fiestas o actividades en clase.

---

## ✨ Características

### 🌍 Multidioma
Disponible en **inglés, francés, japonés, español, italiano y chino**. El idioma se autodetecta a partir del navegador y se puede cambiar manualmente desde la pantalla de inicio. La elección se recuerda entre sesiones (`localStorage`). Las traducciones se cargan dinámicamente desde ficheros JSON en `public/locales/`, así que añadir un idioma nuevo es solo cuestión de crear otro JSON.

### 🗣️ Control por voz
El juego escucha tus respuestas. Di en voz alta cuántos jugadores quedan y el juego avanzará automáticamente — sin tocar la pantalla. El reconocimiento de voz funciona en los 6 idiomas soportados y entiende tanto cifras (*"3"*, *"12"*) como palabras (*"three"*, *"trois"*, *"siete"*, *"二十一"*).

### 📢 Narración completa
Todas las instrucciones se leen en voz alta mediante síntesis de voz, en el idioma seleccionado. El juego anuncia las acciones, pregunta cuántos quedan y proclama al ganador — ideal para que todo el grupo esté al tanto sin mirar la pantalla. La selección de voz prioriza las versiones de mayor calidad disponibles en el sistema (Google, Enhanced, Premium, Neural, Siri…).

### 🎵 Efectos de sonido generados al vuelo
Sin archivos de audio externos. Los sonidos se generan en tiempo real con la Web Audio API:
- **Inicio de partida** → acorde ascendente en Do mayor
- **Nueva ronda** → tick de anuncio
- **Actualización de jugadores** → tono de confirmación
- **Victoria** → fanfarria ascendente
- **Derrota** → melodía descendente

### 👆 Doble sistema de entrada
¿El micrófono no funciona o el entorno es ruidoso? Los botones numéricos en pantalla son siempre una alternativa. El juego acepta ambas formas de entrada simultáneamente y usa la primera que llegue.

### 🎯 25 acciones por idioma
Tocar la nariz, aplaudir, dar saltos, girar sobre sí mismo, cruzar los brazos, sonreír… Cada idioma tiene 25 acciones físicas adaptadas culturalmente, y el juego garantiza que no se repita la misma acción dos veces seguidas.

### 👥 De 1 a 30 jugadores
Configura el número de participantes al inicio y el juego se adapta. Las eliminaciones se registran ronda a ronda hasta que queda un único ganador (o nadie, si todos son eliminados a la vez).

### 📱 Diseñada para móvil
La interfaz se adapta a cualquier tamaño de pantalla. Los botones están optimizados para toque (mínimo 56×56 px) y la tipografía escala con `clamp()` para una lectura cómoda en cualquier dispositivo.

---

## 🕹️ Cómo se juega

1. **Elige el número de jugadores** (entre 1 y 30) y pulsa *Jugar*.
2. El juego anuncia en voz alta una acción, con o sin el prefijo *"Simón dice"*.
   - **Con "Simón dice"** → todos deben realizar la acción.
   - **Sin "Simón dice"** → quien la realice, ¡queda eliminado!
3. Tienes **5 segundos** para que los jugadores actúen (o no actúen).
4. El juego pregunta *"¿Cuántos jugadores quedan?"* — responde por voz o con los botones.
5. La partida continúa hasta que solo quede **1 ganador**.

---

## 🛠️ Tecnología

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Lenguaje | TypeScript 5 (modo estricto) |
| Build | Vite 6 |
| Voz (entrada) | Web Speech API |
| Voz (salida) | Web Speech Synthesis API |
| Audio | Web Audio API |
| i18n | Custom (Context + JSON dinámico) |
| Estilos | CSS Modules + Variables CSS |
| Gestor de paquetes | pnpm |

Sin dependencias externas de UI, sin librerías de audio, sin backend — todo corre en el navegador.

---

## 🚀 Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/simon-dice.git
cd simon-dice

# Instalar dependencias
pnpm install

# Arrancar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

```bash
# Compilar para producción
pnpm build

# Previsualizar el build
pnpm preview

# Verificar tipos sin compilar
pnpm typecheck
```

> **Nota:** El reconocimiento de voz requiere HTTPS en producción (o `localhost` en desarrollo). Se recomienda Chrome o Edge para una compatibilidad óptima con la Web Speech API.

---

## 📋 Requisitos del navegador

| Característica | Chrome | Edge | Firefox | Safari |
|---------------|--------|------|---------|--------|
| Reconocimiento de voz | ✅ | ✅ | ⚠️ Limitado | ⚠️ Limitado |
| Síntesis de voz | ✅ | ✅ | ✅ | ✅ |
| Botones numéricos | ✅ | ✅ | ✅ | ✅ |

El juego funciona en todos los navegadores modernos. En aquellos sin soporte de reconocimiento de voz, la entrada manual por botones está siempre disponible.

---

## 🌐 Añadir un idioma

1. Crear `public/locales/<código>.json` copiando la estructura de uno existente (por ejemplo `en.json`).
2. Traducir las claves de `ui` y `speech`, las 25 acciones y el diccionario `numberWords` (palabra hablada → número de 0 a 30).
3. Añadir el código en `src/i18n/types.ts`:
   - `Locale`, `SUPPORTED_LOCALES`
   - `SPEECH_TAGS` (BCP-47 para Web Speech, p. ej. `de-DE`)
   - `LOCALE_NAMES` (nombre nativo para el selector)

No hace falta tocar nada más: el provider carga el JSON de forma perezosa y el selector se actualiza solo.

---

## 📄 Licencia

MIT — úsalo, modifícalo y compártelo libremente.
