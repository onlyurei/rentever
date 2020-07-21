#!/bin/sh
git pull origin master
npm install --production
grunt buildProd
service nginx restart
