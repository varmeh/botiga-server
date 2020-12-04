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

## [Setting up Reverse Proxy SubDomains](./NginxReverseProxyConfiguration.md)
