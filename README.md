# Food Expert PWA v1

This is the first database-backed PWA build.

Current approved recipe:
- FE-002 — Ultimate Cheeseburger Wellington

Future workflow:
1. Add an approved recipe object to `data/recipes.json`.
2. Deploy the updated files.
3. The Recipe Library, serving scaler, Market List and Cook Mode use the same recipe data.

Deploy with GitHub Pages for a free HTTPS URL suitable for iPhone installation.

Local test:
`python -m http.server 8000`
then open `http://localhost:8000/`.
Do not open `index.html` with `file://`.
