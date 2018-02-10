FROM ghost:1

ENV NODE_ENV=development

ADD config.development.json /var/lib/ghost

RUN apt-get update && apt-get install -y git && \
    mkdir -p /tmp/golang && cd /tmp/golang && \
    wget https://dl.google.com/go/go1.9.4.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.9.4.linux-amd64.tar.gz && \
    mv /usr/local/go/bin/go /usr/local/bin && \
    go get -u github.com/fogleman/primitive && \
    mv $HOME/go/bin/primitive /usr/local/bin && \
    apt-get clean && \
    rm -rf /tmp/* /var/tmp/* /usr/local/go /var/lib/apt/lists/*