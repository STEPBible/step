accept versions that only have
INFO(LINK) and WARNING(NESTING)

find -name "*.log" -print | xargs sed -i 's/INFO(LINK).*//g'
find -name "*.log" -print | xargs sed -i 's/WARNING(NESTING).*//g'
find -name "*.log" -print | xargs sed -i '/^\s*$/d'
