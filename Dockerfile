# Use an official PHP image with Apache
FROM php:8.4-apache

# ENV Arguments 
ARG APP_NAME
ARG APP_ENV
ARG APP_KEY
ARG APP_DEBUG
ARG APP_URL
ARG FRONTEND_URL
ARG LOG_LEVEL
ARG DB_CONNECTION
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG DB_USERNAME
ARG DB_PASSWORD
ARG VITE_BACKEND_ENDPOINT
ARG VITE_GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_ID
ARG MAIL_MAILER
ARG MAIL_HOST
ARG MAIL_PORT
ARG MAIL_USERNAME
ARG MAIL_PASSWORD
ARG MAIL_ENCRYPTION
ARG MAIL_FROM_ADDRESS
ARG MAIL_FROM_NAME

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Enable mod_rewrite
RUN a2enmod rewrite

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Update Apache document root to Laravel public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy Laravel backend code
COPY server/ /var/www/html
COPY client/ /var/www/html/client

# Set working directory
WORKDIR /var/www/html

# ── Delete the .env that came with server/ and build a clean one ──
RUN rm -f .env

# Install Laravel dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Create fresh .env from docker-compose args
RUN echo "error_reporting = E_ALL & ~E_DEPRECATED & ~E_NOTICE" > /usr/local/etc/php/conf.d/custom.ini
RUN echo "APP_NAME=${APP_NAME}" > .env
RUN echo "APP_ENV=${APP_ENV}" >> .env
RUN echo "APP_KEY=${APP_KEY}" >> .env
RUN echo "APP_DEBUG=${APP_DEBUG}" >> .env
RUN echo "APP_URL=${APP_URL}" >> .env
RUN echo "FRONTEND_URL=${FRONTEND_URL}" >> .env
RUN echo "LOG_LEVEL=${LOG_LEVEL}" >> .env
RUN echo "DB_CONNECTION=${DB_CONNECTION}" >> .env
RUN echo "DB_HOST=${DB_HOST}" >> .env
RUN echo "DB_DATABASE=${DB_DATABASE}" >> .env
RUN echo "DB_USERNAME=${DB_USERNAME}" >> .env
RUN echo "DB_PASSWORD=${DB_PASSWORD}" >> .env
RUN echo "DB_PORT=${DB_PORT}" >> .env
RUN echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env
RUN echo "MAIL_MAILER=${MAIL_MAILER}" >> .env
RUN echo "MAIL_HOST=${MAIL_HOST}" >> .env
RUN echo "MAIL_PORT=${MAIL_PORT}" >> .env
RUN echo "MAIL_USERNAME=${MAIL_USERNAME}" >> .env
RUN echo "MAIL_PASSWORD=${MAIL_PASSWORD}" >> .env
RUN echo "MAIL_ENCRYPTION=${MAIL_ENCRYPTION}" >> .env
RUN echo "MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}" >> .env
RUN echo "MAIL_FROM_NAME=CozyLibrary" >> .env

# Write client .env for Vite build
RUN echo "VITE_BACKEND_ENDPOINT=${VITE_BACKEND_ENDPOINT}" > client/.env
RUN echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}" >> client/.env

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Build React frontend
RUN cd client && npm install && npm run build

# Move React build to Laravel public directory
RUN cp -r client/dist/* public/

# Expose port 80 for Apache
EXPOSE 80

CMD ["apache2-foreground"]