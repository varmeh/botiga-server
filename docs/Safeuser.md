- [Safeuser for all servers](#safeuser-for-all-servers)
  - [Create a user](#create-a-user)
  - [Root level access](#root-level-access)
  - [Ssh Key for safeuser](#ssh-key-for-safeuser)
    - [Allow Password Authentication](#allow-password-authentication)
    - [Copy your ssh-key](#copy-your-ssh-key)
  - [Refernce Docs](#refernce-docs)

# Safeuser for all servers

One of the most basic tasks that you should know how to do on a fresh Linux server is add and remove users.

When you create a new system, you are often only given the root account by default.

If you run your code using the root account, and if a hostile party compromises the code, that party could get total control of your VPS.

To avoid this, let’s setup a safe account that can still perform root operations if we supply the appropriate password.

For the purposes of this document, let’s call our safe user **safeuser**

## Create a user

-   Create a non-admin user

```
adduser safeuser
```

-   It should ask for a password & some information
-   Once provided, should create a `safeuser`

## Root level access

-   We have a new user account with regular account privileges. However, we may sometimes need to do administrative tasks.

-   To avoid having to log out of our normal user and log back in as the root account, give the safe user permission to use root level commands

```
usermod -aG sudo safeuser
```

-   `safeuser` in last command refers to default group attached to each user when created

## Ssh Key for safeuser

-   If you would try to copy your ssh-key, you would get `Permission Denied (publickey)` error

-   This is the default configuration in Ubuntu image at Digital Ocean to avoid un-intended access using passwords

-   To faciliate this ssh copy, enable `password authentication` on droplet

### Allow Password Authentication

-   To enable password authentication, open file:

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

-   Now, you should be able to copy your ssh key

-   Once copied, `Disable Password Authentication` again

### Copy your ssh-key

-   Open a new terminal on your computer

```
ssh-copy-id -i .ssh/id_rsa_botiga_drop safeuser@<IP>
```

-   Now, you could login to safeuser using your ssh key

-   This will either create the `.ssh/authorized_file` in `/home/safeuser` or will add your key to existing file

-   You could now login using your ssh command

## Refernce Docs

-   [Initial Server Setup with Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)
-   [How to Add and Delete Users on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-add-and-delete-users-on-ubuntu-18-04)
-   [Error Permission denied (publickey) when I try to ssh](https://www.digitlocean.com/community/questions/error-permission-denied-publickey-when-i-try-to-ssh)
-   [UFW Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)
-   [How To Set Up a Firewall with UFW on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)
