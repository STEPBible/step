echo "Starting post install script..." > /var/log/step-post-install.log

eval echo "Home directory is ~" >> /var/log/step-post-install.log

echo "Changing permissions to allow read/write to this directory"
chmod -R 777 /opt/step/homes >> /var/log/step-post-install.log

echo "Linking files" >> /var/log/step-post-install.log
ln -sf /opt/step/homes/sword ~/.sword >> /var/log/step-post-install.log
ln -sf /opt/step/homes/jsword ~/.jsword >> /var/log/step-post-install.log
[ -d "~/Desktop" ] && ln -sf /opt/step/step.desktop ~/Desktop/step.desktop >> /var/log/step-post-install.log

origUser=`pstree -lu -s $$ | grep --max-count=1 -o '([^)]*)' | head -n 1 | sed 's/(//' | sed 's/)//'`
echo "Orig user is $origUser.  Adding links for $origUser home directory"
if [ ! -z "$origUser" ]
then
    [ -d "/home/$origUser/Desktop" ] && [ ! -f "/home/$origUser/Desktop/step.desktop" ] && ln -s /opt/step/step.desktop /home/$origUser/Desktop/step.desktop  >> /var/log/step-post-install.log
    [ -d "/home/$origUser" ] && [ ! -h "/home/$origUser/.sword" ] && ln -s /opt/step/homes/sword /home/$origUser/.sword >> /var/log/step-post-install.log
    [ -d "/home/$origUser" ] && [ ! -h "/home/$origUser/.jsword" ] && ln -s /opt/step/homes/jsword /home/$origUser/.jsword >> /var/log/step-post-install.log
fi
