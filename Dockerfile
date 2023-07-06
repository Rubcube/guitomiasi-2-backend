FROM --platform=linux/amd64 node:18.16.1

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install app dependencies
RUN yarn install

EXPOSE 3344

CMD [ "yarn", "start" ]
