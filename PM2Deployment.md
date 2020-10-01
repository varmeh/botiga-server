# PM2 for Server Deployment

This document lists down all the steps for express app deployment using PM2

## Create a Safe Account to Run Your Code

If you run your code using the root account, and if a hostile party compromises the code, that party could get total control of your VPS.

To avoid this, let’s setup a safe account that can still perform root operations if we supply the appropriate password.

For the purposes of this document, let’s call our safe user **safeuser**

### [How to add a User](https://www.digitalocean.com/community/tutorials/how-to-add-and-delete-users-on-ubuntu-16-04)

-   Create a non-admin user

```
adduser safeuser
```

-   Give the safe user permission to use root level commands

```
usermod -aG sudo safeuser
```

-   Logging to this user will not work, as `PasswordAuthentication` is set to NO by default in `sshd_config`

-   To fix it, do the following:

```
sudo nano /etc/ssh/sshd_config
```

Change:

-   `PermitRootLogin yes`
-   `PasswordAuthentication yes`

And restart the service:

```
sudo systemctl restart sshd
```

-   Now, you could login to safeuser using your password

-   Time to add `ssh-passkey` for authentication

```
ssh-copy-id -i .ssh/id_rsa_botiga_devdrop safeuser@<IP>
```

This will create the `.ssh/authorized_file` in `/home/safeuser`

-   You could now login using your ssh command

```
ssh -i .ssh/id_rsa_botiga_devdrop safeuser@<IP>
```

To make your system safer, revert your changes in sshd_config file.

### Optional - Allowing access to PORT 80

Safe user does not have permission to use the default HTTP port (80).

To fix it, run following commands.

```
sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep /usr/bin/node
```

## Installations

`Required Only` when not using DigitalOcean Nodejs image which comes pre-packed with following:

-   Nodejs - 12.18.0
-   NPM - 6.14.4
-   NGINX - 1.17.10
-   PM2 - 4.4.0
-   GIT - 2.25.1

### Nodejs

```
sudo apt install nodejs
```

[Instructions for Nodejs Versions](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)

### PM2

```
sudo npm install -g pm2
```

-   Install PM2 Auto Completion

```
pm2 completion install
```

To use PM2 auto-completion, open a new terminal

### Git

```
sudo apt-get install git
```

## Botiga Server App

You will be prompted for your password - i.e. the safe user password

-   To access git app from dev server, generate a ssh key on server for safeuser

```
ssh-keygen -t rsa
```

-   Now, copy the contents of `.ssh/id_rsa.pub` to
    -   `Gitlab -> Project -> Settings -> Deploy Keys -> Create New Key`
    -   `Github -> Settings -> Deploy Keys -> Add Deploy Key`

```
git clone git@github.com:varmehta/botiga-server.git
```

## Running Express App

-   Move to `botiga-server` folder
-   Add a `.env` file to `botiga-server` folder with correct values for environment variables

-   Edit variables
-   Copy `firebase-admin-sdk.json` file to server & set it's path to `GOOGLE_APPLICATION_CREDENTIALS`

```
npm install
pm2 start npm --name="botiga-server"  --node-args="--expose-gc" --time -- start
```

_Above command will run start script from package.json_

Advantages of running your application with PM2:

-   it automatically restarts your application if it crashes
-   it keeps a log of your unhandled exceptions at `/home/safeuser/.pm2/logs`
-   With one command, PM2 can ensure that any applications it manages restart when the server reboots. Basically, your node application will start as a service

## Running PM2 as a service

Applications that are running under PM2 will be restarted automatically if the application crashes or is killed.

**But what to do if server crashed?**

To cater this scenario, run PM2 as a service which will restart application on server reboot.

-   To do so, use `startup` subcommand
-   The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots

```
pm2 startup systemd
```

-   The last line of the resulting output will include a command that you must run with superuser privileges:

```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u safeuser --hp /home/safeuser
```

-   This will create a systemd `unit` which runs pm2 for your user on boot

## References

-   [How to deploy express app on digital ocean?](https://itnext.io/deploy-a-nodejs-and-expressjs-app-on-digital-ocean-with-nginx-and-free-ssl-edd88a5580fa)
-   [How To Use PM2 to Setup a Node.js Production Environment On An Ubuntu VPS?](https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps)
-   [How to Run PM2 as a service on ubuntu server?](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)
-   [PM2 Startup Documentation](https://pm2.keymetrics.io/docs/usage/startup/)
