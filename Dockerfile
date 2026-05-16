# syntax=docker/dockerfile:1
FROM php:8.2-apache
 
# Fix MPM conflict
RUN a2dismod mpm_event || true
RUN a2enmod mpm_prefork
RUN a2enmod rewrite
 
# Install PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql
 
# Apache config
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf
 
# Copy files
COPY . /var/www/html/
RUN chmod -R 755 /var/www/html
 
EXPOSE 80
CMD ["apache2-foreground"]
 