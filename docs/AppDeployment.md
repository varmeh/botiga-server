# Botiga App Deployment

- [Botiga App Deployment](#botiga-app-deployment)
  - [Droplet Creation](#droplet-creation)
  - [Create a Non-Admin user](#create-a-non-admin-user)
  - [Installations](#installations)
    - [Nodejs](#nodejs)
    - [PM2](#pm2)
  - [Download Botiga Server App](#download-botiga-server-app)
  - [Running Express App](#running-express-app)
    - [Copy configuration files](#copy-configuration-files)
    - [Configure app](#configure-app)
  - [Configure Firewall](#configure-firewall)
    - [Access to PORT 80](#access-to-port-80)
  - [Configure PM2 as a service](#configure-pm2-as-a-service)
  - [References](#references)

This document lists down all the steps for express app deployment using PM2

## Droplet Creation

- Create a new droplet with latest version of ubuntu

## [Create a Non-Admin user](Safeuser.md)

## Installations

- First of all, update apt to access packages

```shell
sudo apt update
```

### Nodejs

```shell
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
```

[Instructions for Nodejs Versions](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)

### PM2

```shell
sudo npm install -g pm2
```

- Install PM2 Auto Completion

```shell
pm2 completion install
```

- To use PM2 auto-completion, open a new terminal

## Download Botiga Server App

You will be prompted for your password - i.e. the safe user password

- To access git app from server, generate a ssh key on server for safeuser

```shell
ssh-keygen -t rsa
```

- Now, copy the contents of `.ssh/id_rsa.pub` to
  - `Gitlab -> Project -> Settings -> Deploy Keys -> Create New Key`
  - `Github -> Settings -> Deploy Keys -> Add Deploy Key`

```shell
git clone git@github.com:varmehta/botiga-server.git
```

## Running Express App

### Copy configuration files

- To run app, we need a .env file
- The easiest way to configure it is by copying it from your local setup to your droplet.
- To do so, open your local terminal & cd to your botiga-server project:

```shell
scp -i ~/.ssh/id_rsa_botiga_drop ./.env.prod safeuser@<your_server_ip>:/home/safeuser/botiga-server/.env
```

- Also, copy `firebase-adminsdk.json` files

```shell
scp -i ~/.ssh/id_rsa_botiga_drop /Users/varunmehta/Projects/botiga/firebase-adminsdk-prod.json safeuser@<your_server_ip>:/home/safeuser/botiga-server/firebase-adminsdk-prod.json
```

### Configure app

- Move to `botiga-server` folder
<!-- -   Set `firebase-admin-sdk.json` path to `GOOGLE_APPLICATION_CREDENTIALS`

````
export GOOGLE_APPLICATION_CREDENTIALS=/home/safeuser/botiga-server/firebase-adminsdk-prod.json
``` -->

- Verify your `.env` file

```shell
npm install
pm2 start npm --name="botiga-server" --node-args="--expose-gc" --time -- start
```

`Above command will run start script from package.json`

Advantages of running your application with PM2:

- it automatically restarts your application if it crashes
- it keeps a log of your unhandled exceptions at `/home/safeuser/.pm2/logs`
- With one command, PM2 can ensure that any applications it manages restart when the server reboots. Basically, your node application will start as a service

## Configure Firewall

- Enable it. Refer [Firewall](FirewallSetup.md)

- Allow port number defined in file on which app will run

```shell
sudo ufw allow 5000
```

- Check status afterwards

```shell
sudo ufw status
```

- Confirm app access from your browser with url `http://143.110.190.70:5000/api/live`

### Access to PORT 80

Following steps should be followed in case you need to enable http port.

Safe user does not have permission to use the default HTTP port (80).

To fix it, run following commands.

```shell
sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep /usr/bin/node
```

## Configure PM2 as a service

- Applications that are running under PM2 will be restarted automatically if the application crashes or is killed.

- _But what to do if server crashed?_

- To cater this scenario, run PM2 as a service which will restart application on server reboot.

- To do so, use `startup` subcommand
- The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots

```shell
pm2 startup systemd
```

- The last line of the resulting output will include a command that you must run with superuser privileges:

```shell
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u safeuser --hp /home/safeuser
```

- This will create a systemd `unit` which runs pm2 for your user on boot

## References

- [How to deploy express app on digital ocean?](https://itnext.io/deploy-a-nodejs-and-expressjs-app-on-digital-ocean-with-nginx-and-free-ssl-edd88a5580fa)
- [How To Use PM2 to Setup a Node.js Production Environment On An Ubuntu VPS?](https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps)
- [How to Run PM2 as a service on ubuntu server?](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)
- [PM2 Startup Documentation](https://pm2.keymetrics.io/docs/usage/startup/)
