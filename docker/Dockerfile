FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx configuration as a template
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template

# Copy static files
COPY app/static /usr/share/nginx/html/static
COPY app/templates/index.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80
