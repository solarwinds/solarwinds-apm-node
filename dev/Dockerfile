FROM ubuntu:22.04
SHELL ["/bin/bash", "-c"]

# general tools
RUN apt update \
    && apt -y install \
                curl \
                git \
                nano \
                g++ \
                python3 \
                python-is-python3 \
                make

# set time zone (for github cli)
ENV TZ=America/Vancouver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# for github cli
RUN apt -y install \
            gnupg \
            software-properties-common \
            tzdata

# get and install github cli
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh -y

# install nvm
ENV NVM_DIR /root/.nvm

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# these are the stable versions as of April 2022
# can't use lts alias due to all sorts of Dockerfile limitations.
RUN source $NVM_DIR/nvm.sh \
    && nvm install v20.0.0 \
    && nvm install v18.16.0 \
    && nvm install v16.20.0 \
    && nvm install stable

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v16.20.0/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v16.20.0/bin:$PATH

# Install tools needed for specific service tests (pg, oracle)
RUN apt -y install \
            libaio1 \
            postgresql-server-dev-all \
            zip \
            unzip

# get and install oracle library
RUN curl -LO https://download.oracle.com/otn_software/linux/instantclient/195000/instantclient-basic-linux.x64-19.5.0.0.0dbru.zip \
    && mkdir /opt/oracle \
    && unzip instantclient-basic-linux.x64-19.5.0.0.0dbru.zip -d /opt/oracle/ \
    && rm instantclient-basic-linux.x64-19.5.0.0.0dbru.zip

# set for usage
ENV LD_LIBRARY_PATH /opt/oracle/instantclient_19_5:$LD_LIBRARY_PATH
