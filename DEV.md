
# Integrating

```html
<!-- SITE ENGINE --> 
<link rel="stylesheet" 
  href="https://23carati-site-engine.netlify.app/site.css"
  dev-href="http://127.0.0.1:3000/dist/site.css"
  > 
<script defer 
  src="https://23carati-site-engine.netlify.app/index.js" 
  dev-src="http://127.0.0.1:3000/dist/index.js"
  ></script>
```

# Environments 

Ensure .env are current and committed.  No secrets. 


## Dev

```
npm run dev
```

Use Sygnal DevTools to switch to dev context for the scripts. 

## Test

*Currently unused*

## Prod

Commit and push. 

Netlify will pick up the `main` repo branch and publish. 

The `.env.prod` env vars should be used. 

# Utilities

About cross-env: It's a utility that sets environment variables cross-platform. On Windows, NODE_ENV=production doesn't work, but cross-env NODE_ENV=production does. Install it:
npm install --save-dev cross-env

