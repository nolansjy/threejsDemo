# README
Webpage: https://threejsdemo.onrender.com  
Server: https://sheetsapi-f7ls.onrender.com  

This is a website with a Vite/Three.js front-end and Node.js backend hosted on Render. Note that the Render server may take a while to load on first start, as it spins down after inactivity (15 minutes). 

You must log in with Google before accessing the site. Login uses a GSI popup and the session is stored with a HMAC-signed cookie.

## Directory
server/ --> Node server files  
src/ --> main.js, src/api --> exports api functions, src/styles --> css files  
index.html --> redirects to auth.html for login or app.html if already logged in  

## Known Bugs
- A Logout button was implemented but is bugged. Clear cookies manually in order to log out. 
