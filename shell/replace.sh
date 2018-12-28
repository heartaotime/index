#!/usr/bin/env bash
path="/root/nginx-1.14.2/html/index"
if [ -d "$path" ]; then
    mv /root/nginx-1.14.2/html/index /root/nginx-1.14.2/html/index.`date +%Y%m%d%H%M%S`
fi
\cp -rf /root/.jenkins/workspace/index /root/nginx-1.14.2/html/
echo "Replace index Success"