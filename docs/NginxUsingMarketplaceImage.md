# Nginx using Marketplace Image

- The fastest & easiest way to start a nginx server is using [Nodejs](https://do.co/313ycRT) image in Digital Ocean Marketplace

- Just create a droplet with this image
- It has pre-configured firewall for nginx access

- To test nginx, type following in your browser:

```shell
http://your_server_ip
```

- You should land on nginx landing page

## Deleting default app

- Once you have verified your droplet, it's time to delete app loaded to this image

- Delete app

```shell
sudo -u nodejs pm2 delete hello
```

- Stop it from running on Droplet boot

```shell
sudo -u nodejs pm2 save
```

## [Setup a Non-Root User](./Safeuser.md)

- **Note:** Make sure you login as safeuser before setting up nginx reverse proxy

## [Setting up Nginx Reverse Proxy](./NginxReverseProxyConfiguration.md)
