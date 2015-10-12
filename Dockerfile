FROM ubuntu:14.04

MAINTAINER Martin Wood-Mitrovski "marvotron@gmail.com"

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y nodejs

# needs this to find the nodejs exec
RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN apt-get install -y npm
RUN apt-get install -y git
RUN apt-get install -y libtag1-dev

WORKDIR /app

# package
COPY package.json /app/package.json

# Bundle app source
COPY src /app/src

# Install app dependencies
RUN cd /app; npm install

CMD ["node", "src/bacron.js","-d","/media"]