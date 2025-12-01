# Deploy & CORS Troubleshooting Checklist

1. Commit and push changes to your remote repository.

2. On Render (or your hosting), trigger a redeploy.

3. Confirm build logs show `npm install` completed and `cors` was installed.

4. After deploy, in your browser:
   - Open DevTools -> Network.
   - Reproduce the login request from your Vercel frontend.
   - Look for the OPTIONS request to `/api/auth/login`.
     - Confirm response status is 200 or 204.
     - Confirm response headers include `Access-Control-Allow-Origin` matching your Vercel origin.

5. If blocked, check Render service logs for console warnings like `CORS rejection: origin=...` or `Preflight request: ...`.

6. If origin differs from expected, add the exact origin to `Backend/server.js` `allowedOrigins` list, commit, and redeploy.

7. For local testing run:
```powershell
cd 'c:\Users\kunal\OneDrive\CHAT MERN'
npm install
npm run start
```

8. If problems persist, capture and share:
   - The full request/response headers for the failing OPTIONS and POST requests.
   - Render deployment logs showing server start output.

Good luck — ping me the failing request details and I'll adjust the policy.
