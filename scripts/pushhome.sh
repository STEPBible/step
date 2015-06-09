#!/bin/sh 
set -e

#swaps the user home on Windows

if [[ -z "$1" ]] ; then
  echo "Need to specify one argument"
  exit
fi

cd "$1"

for d in */ ; do
    total=`wc -l $d/* | grep total | sed -e 's/total//g'`
	#echo $total
	
	if [ $total -gt 600 ]; thencd sc
		echo $d $total
	fi
done
