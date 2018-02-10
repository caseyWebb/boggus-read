#!/bin/sh

rm -rf content

echo "\nInstalling ghost-storage-preprocessor and ghost-storage-preprocessor-transform-sqip"
mkdir -p content/adapters/storage/preprocessor/transforms
cp -r ./node_modules/ghost-storage-preprocessor/** content/adapters/storage/preprocessor
cp -r ./node_modules/ghost-storage-preprocessor-transform-sqip content/adapters/storage/preprocessor/transforms/sqip
cd content/adapters/storage/preprocessor && yarn install --no-lockfile && cd -
cd content/adapters/storage/preprocessor/transforms/sqip && yarn install --no-lockfile && cd -

echo "\nRemoving existing docker container (if exists)"
docker rm boggus-read-backend || true

echo "\nBuilding docker image and container"
docker build -t boggus-read-backend .
docker create --name boggus-read-backend -p 2368:2368 -v $PWD/content:/var/lib/ghost/content boggus-read-backend

echo "\n✨  All done! Run \`yarn start:backend\` to start the docker container.\n"