# Neorons website — container for Cloud Run (Option B)
# Build context: repository root.  docker build -f deploy/gcp/Dockerfile .
FROM nginx:alpine

# Cloud Run injects $PORT (default 8080); template it into the nginx config.
ENV PORT=8080

COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/deploy /usr/share/nginx/html/scripts \
           /usr/share/nginx/html/.git 2>/dev/null || true

RUN printf 'server {\n\
    listen ${PORT};\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    add_header X-Frame-Options "DENY" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
    add_header Content-Security-Policy "default-src '"'"'self'"'"'; style-src '"'"'self'"'"' '"'"'unsafe-inline'"'"'; script-src '"'"'self'"'"'; img-src '"'"'self'"'"' data: https://*.basemaps.cartocdn.com; font-src '"'"'self'"'"'; form-action '"'"'self'"'"' https://formspree.io; frame-ancestors '"'"'none'"'"'" always;\n\
    error_page 404 /404.html;\n\
    location / { try_files $uri $uri/ =404; }\n\
    gzip on;\n\
    gzip_types text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
