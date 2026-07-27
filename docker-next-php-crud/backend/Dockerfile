FROM php:8.3-fpm-alpine

# Install system dependencies for PostgreSQL and Nginx
RUN apk add --no-cache libpq-dev nginx

# Install PHP extensions for PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copy configurations
COPY nginx.conf /etc/nginx/nginx.conf

# Set work directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Ensure correct file permissions for Nginx
RUN chown -R nginx:nginx /var/www/html

# Expose Nginx port
EXPOSE 8000

# Start both PHP-FPM and Nginx simultaneously
CMD php-fpm -D && nginx -g "daemon off;"

