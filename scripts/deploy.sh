#!/usr/bin/env sh

set -e

# npm run build
npm run build --env.VERSION=1.0.7

cd dist

# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

git push -f git@github.com:jerry914/ai-annotated-judgment-database.git main:gh-pages

cd -