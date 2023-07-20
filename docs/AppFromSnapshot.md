# App from Droplet Snapshot

## Configure App Server

- Create a new droplet from snapshot

- Add it's IP to mongodb network access whitelist

- Check port 5000 is allowed

```shell
sudo ufw status
```

- If not configured, allow it with following command:

```shell
sudo ufw allow 5000
```

- Start app with pm2

```shell
pm2 start npm --name="botiga-server" --node-args="--expose-gc" --time -- start
```

- Confirm app access from your browser with url `http://159.65.158.76:5000/api/live`
- Confirm app connected to mongodb with url `http://159.65.158.76:5000/api/services/businessCategory`

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

## Add AppServer to nginx

- Connect to nginx via terminal

```shell
ssh -i ~/.ssh/id_rsa_botiga_drop safeuser@157.245.101.41
```

- Add droplet private app to `upstream appservers` block of nginx file

```shell
sudo nano /etc/nginx/sites-enabled/prod.botiga.app
```

- Retest configuration & reload configuration:

```shell
sudo nginx -t
sudo systemctl reload nginx
```
