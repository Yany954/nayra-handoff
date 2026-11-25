# Cómo activar la búsqueda real de eventos (y «Adaptar con IA»)

En local, sin llaves, todo funciona con **datos de prueba** (*fixtures*): «Buscar ahora» corre la función real en el emulador con 4 eventos `[ejemplo]` y un resultado malicioso que debe descartarse. Para resultados reales hacen falta dos llaves. **Nunca las pegues en el chat ni en el código.**

## 1. Conseguir las llaves
- **OpenAI**: crea una llave **nueva solo para este proyecto** en platform.openai.com → API keys. Mantén el tope de gasto de la cuenta (ej. USD 5).
- **Tavily**: crea una cuenta en tavily.com (plan gratis: 1.000 créditos al mes, sin tarjeta) y copia la API key.

## 2. Probar en local (opcional)
Crea `functions/.secret.local` (está en `.gitignore`):
```
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```
Para «Adaptar con IA» en local, agrega también `OPENAI_API_KEY=sk-...` a `.env.local`. Reinicia `npm run emulators` y `npm run dev`. «Buscar ahora» usará las APIs reales; revisa el costo en el aviso de la pestaña (tokens usados) y en el panel de OpenAI.

## 3. Producción (cuando hagamos el deploy, Fase 7)
```
firebase use nayra-lancheros
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set TAVILY_API_KEY
firebase apphosting:secrets:set OPENAI_API_KEY   # para «Adaptar con IA» en el panel
```
Cada comando te pide la llave en la terminal (no queda en el historial ni en el repo).

## Costo esperado
Unas 10 ejecuciones al mes × 15 búsquedas = ~150 créditos de Tavily (gratis) y ~0,5 M tokens de OpenAI (≈ USD 0,20 con `gpt-5-mini`). Topes por ejecución en `functions/src/scan/runScan.ts` (`LIMITS`).
