# Nginx Reverse Proxy

## Setting up Reverse Proxy SubDomains

- Reference [Setting up Server Domain](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)

- Let's say we want to create a reverse proxy with subdomain `prod.botiga.app`

- To do so, we would need to set a new domain - `prod.botiga.app` with nginx

- Let's start the process by creating the directory for your `prod.botiga.app` domain as follows, using the `-p` flag to create any necessary parent directories:

```shell
sudo mkdir -p /var/www/prod.botiga.app/html
```

- Next, assign ownership of the directory with the `$USER` environment variable:

```shell
sudo chown -R $USER:$USER /var/www/prod.botiga.app/html
```

- Change permissions

```shell
sudo chmod -R 755 /var/www/prod.botiga.app
```

- In order to serve content from this domain, either you can add the requiste server block to the default configuration file or create a new one

- To create a new one:

```shell
sudo nano /etc/nginx/sites-available/prod.botiga.app
```

- Paste the following configuration block

```nginx
upstream appServers {
    least_conn;
    server 10.122.0.2:5000;
}

server {
    listen 80;
    listen [::]:80;

    server_name prod.botiga.app;

    location / {
        proxy_pass http://appServers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- While the `server_name` directive declares which domain will be catered, `location` directive declares how this will be done

- `location` block above sets the [**Reverse Proxy Server**](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04#step-4-%E2%80%94-setting-up-nginx-as-a-reverse-proxy-server) for domain `prod.botiga.app`

- Now, link the configuration to enabled sites

```shell
sudo ln -s /etc/nginx/sites-available/prod.botiga.app /etc/nginx/sites-enabled/
```

- Two server blocks in default & prod.botiga.app are now enabled and configured to respond to requests based on their `listen` and `server_name` directives

  - `prod.botiga.app`: Will respond to requests for `prod.botiga.app`
  - `default`: Will respond to any requests on port 80 that do not match the other two blocks

- Retest configuration & reload configuration:

```shell
sudo nginx -t
sudo systemctl reload nginx
```

## [Secure Nginx with Let's Encrypt TLS](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)

- The first step to using Let’s Encrypt to obtain an SSL certificate is to install the Certbot software on your server

```shell
sudo apt install certbot python3-certbot-nginx
```

- Obtaining the certificate

```shell
sudo certbot --nginx -d prod.botiga.app
```

- Verifying Certbot Auto-Renewal

```shell
sudo systemctl status certbot.timer
```

- To test the renewal process, do a dry run with `certbot`

```shell
sudo certbot renew --dry-run
```
