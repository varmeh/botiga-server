- [Safeuser for all servers](#safeuser-for-all-servers)
  - [Add a user](#add-a-user)
    - [Create a user](#create-a-user)
    - [Ssh Key for safeuser](#ssh-key-for-safeuser)
    - [Root level access](#root-level-access)
    - [Allowing access to PORT 80](#allowing-access-to-port-80)
  - [Setting up a Basic Firewall](#setting-up-a-basic-firewall)
  - [Debugging](#debugging)
    - [Permission denied error on login with safeuser](#permission-denied-error-on-login-with-safeuser)
  - [Refernce Docs](#refernce-docs)

# Safeuser for all servers

One of the most basic tasks that you should know how to do on a fresh Linux server is add and remove users.

When you create a new system, you are often only given the root account by default.

If you run your code using the root account, and if a hostile party compromises the code, that party could get total control of your VPS.

To avoid this, let’s setup a safe account that can still perform root operations if we supply the appropriate password.

For the purposes of this document, let’s call our safe user **safeuser**

## Add a user

### Create a user

-   Create a non-admin user

```
adduser safeuser
```

-   It should ask for a password & some information
-   Once provided, should create a `safeuser`

### Ssh Key for safeuser

-   To access safeuser using ssh key, copy ssh key using command from your system terminal

```
ssh-copy-id -i .ssh/id_rsa_botiga_devdrop safeuser@<IP>
```

-   Now, you could login to safeuser using your ssh key

This will either create the `.ssh/authorized_file` in `/home/safeuser` or will add your key to existing file

-   You could now login using your ssh command

### Root level access

-   We have a new user account with regular account privileges. However, we may sometimes need to do administrative tasks.

-   To avoid having to log out of our normal user and log back in as the root account, give the safe user permission to use root level commands

```
usermod -aG sudo safeuser
```

-   `safeuser` in last command refers to default group attached to each user when created

### Allowing access to PORT 80

Safe user does not have permission to use the default HTTP port (80).

To fix it, run following commands.

```
sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep /usr/bin/node
```

## Setting up a Basic Firewall

-   Ubuntu 20.04 servers can use the UFW firewall to make sure only connections to certain services are allowed
-   Applications can register their profiles with UFW upon installation
-   These profiles allow UFW to manage these applications by name. OpenSSH, the service allowing us to connect to our server now, has a profile registered with UFW

-   See the list of registered applications with ufw:

```
sudo ufw app list
```

-   To enable more options, refer [Setting Up a Basic Firewall](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)

## Debugging

### Permission denied error on login with safeuser

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

-   Now, you should be able to login with ssh key

To make your system safer, revert your changes in sshd_config file.

## Refernce Docs

-   [Initial Server Setup with Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)
-   [How to Add and Delete Users on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-add-and-delete-users-on-ubuntu-18-04)
-   [Error Permission denied (publickey) when I try to ssh](https://www.digitlocean.com/community/questions/error-permission-denied-publickey-when-i-try-to-ssh)
-   [UFW Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)
-   [How To Set Up a Firewall with UFW on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)
