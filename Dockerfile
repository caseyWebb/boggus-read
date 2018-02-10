FROM ghost:1-alpine

ENV NODE_ENV development
ADD config.development.json /var/lib/ghost