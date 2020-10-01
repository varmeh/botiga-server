# Nginx Deployment

## Installing Nginx

```
sudo apt update
sudo apt install nginx
```

## Adjust Firewall

-   Before testing Nginx, the firewall software needs to be adjusted to allow access to the service.
-   Nginx registers itself as a service with ufw upon installation, making it straightforward to allow Nginx access.
-   List the application configurations that `ufw` knows how to work with by typing:

```
sudo ufw app list
```

It should show `Nginx Full`, `Nginx HTTP` & `Nginx HTTPS`.

As demonstrated by the output, there are three profiles available for Nginx:

-   `Nginx Full`: This profile opens both port 80 (normal, unencrypted web traffic) and port 443 (TLS/SSL encrypted traffic)
-   `Nginx HTTP`: This profile opens only port 80
-   `Nginx HTTPS`: This profile opens only port 443

-   Now, enable profile:

```
sudo ufw allow 'Nginx Full'
```

-   Verify Status

```
sudo ufw status
```

## Managing Nginx

-   Stop Nginx

```
sudo systemctl stop nginx
```

-   Start Nginx

```
sudo systemctl start nginx
```

-   Restart Nginx

```
sudo systemctl restart nginx
```

-   Reload configuration changes without dropping connections

```
sudo systemctl reload nginx
```

-   Test your Nginx Configuration file `/etc/nginx/nginx.conf`

```
sudo nginx -t
```

### Avoid Nginx Hash bucket problem

```
sudo nano /etc/nginx/nginx.conf
```

-   Uncomment the `server_names_hash_bucket_size` directive

```
...
http {
    ...
    server_names_hash_bucket_size 64;
    ...
}
...
```

-   Save & close the file
-   Check the configuration

```
sudo nginx -t
```

-   If all ok, restart Nginx to enable your changes

```
sudo systemctl restart nginx
```

## Setting up Server Domain

This has been explained in detail in section [Step 5 – Setting Up Server Blocks](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04).

## Setting up Reverse Proxy SubDomains

-   Let's say we want to create a reverse proxy with subdomain `api.botiga.app`

-   To do so, we would need to set a new domain - `api.botiga.dev` with nginx

-   Let's start the process by creating the directory for your `api.botiga.app` domain as follows, using the `-p` flag to create any necessary parent directories:

```
sudo mkdir -p /var/www/api.botiga.app/html
```

-   Next, assign ownership of the directory with the `$USER` environment variable:

```
sudo chown -R $USER:$USER /var/www/api.botiga.app/html
```

-   Change permissions

```
sudo chmod -R 755 /var/www/api.botiga.app
```

-   In order to serve content from this domain, either you can add the requiste server block to the default configuration file or create a new one

-   To create a new one:

```
sudo nano /etc/nginx/sites-available/api.botiga.app
```

-   Paste the following configuration block

```
server {
    listen 80;
    listen [::]:80;

    server_name api.botiga.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

-   While the `server_name` directive declares which domain will be catered, `location` directive declares how this will be done

-   `location` block above sets the [**Reverse Proxy Server**](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04#step-4-%E2%80%94-setting-up-nginx-as-a-reverse-proxy-server) for domain `api.botiga.dev`

-   Now, link the configuration to enabled sites

```
sudo ln -s /etc/nginx/sites-available/api.botiga.app /etc/nginx/sites-enabled/
```

-   Two server blocks in default & api.botiga.dev are now enabled and configured to respond to requests based on their `listen` and `server_name` directives

    -   `api.botiga.dev`: Will respond to requests for `api.botiga.dev`
    -   `default`: Will respond to any requests on port 80 that do not match the other two blocks

-   Retest configuration & reload configuration:

```
sudo nginx -t
sudo systemctl restart nginx
```

## [Secure Nginx with Let's Encrypt TLS](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)

-   The first step to using Let’s Encrypt to obtain an SSL certificate is to install the Certbot software on your server

```
sudo apt install certbot python3-certbot-nginx
```

-   Obtaining the certificate

```
sudo certbot --nginx -d api.botiga.dev
```

-   Verifying Certbot Auto-Renewal

```
sudo systemctl status certbot.timer
```

-   To test the renewal process, do a dry run with `certbot`

```
sudo certbot renew --dry-run
```
