# Ubuntu Basic Firewall

-   Ubuntu 20.04 servers can use the UFW (Uncomplicated Firewall) to make sure only connections to certain services are allowed
-   Applications can register their profiles with UFW upon installation
-   These profiles allow UFW to manage these applications by name. OpenSSH, the service allowing us to connect to our server now, has a profile registered with UFW

## Installation

-   Usually, all droplets come pre-installed with ufw
-   In case, it's missing, install it using:

```
sudo apt install ufw
```

## Manage UFW

-   Check status

```
sudo ufw status
```

-   To enable ufw, use command:

```
sudo ufw enable
```

-   Check app list status

```
sudo ufw app list
```

## Setting up Default Policies

-   If you’re just getting started with your firewall, the first rules to define are your default policies
-   These rules control how to handle traffic that does not explicitly match any other rules
-   By default, UFW is set to deny all incoming connections and allow all outgoing connections

```
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

-   See the list of registered applications with ufw:

```
sudo ufw app list
```

-   To enable more options, refer [Setting Up a Basic Firewall](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)

## Allow ssh

```
sudo ufw allow ssh
```

## Allow Webports

-   Http - `sudo ufw allow http` Or `sudo ufw allow 80`
-   Https - `sudo ufw allow https` Or `sudo ufw allow 443`

## Enable Nginx

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

## Reference Docs

-   [How To Set Up a Firewall with UFW on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-20-04)
