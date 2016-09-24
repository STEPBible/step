echo "Starting post install script..." > /var/log/step-post-install.log


echo "Moving files from sword" >> /var/log/step-post-install.log
eval echo "Home directory is ~" >> /var/log/step-post-install.log

mkdir -p ~/.sword >> /var/log/step-post-install.log
rsync --remove-source-files -a /opt/step/homes/sword ~/.sword >> /var/log/step-post-install.log

echo "Moving files from jsword" >> /var/log/step-post-install.log
mkdir -p ~/.jsword
rsync --remove-source-files -a /opt/step/homes/jsword ~/.jsword >> /var/log/step-post-install.log
