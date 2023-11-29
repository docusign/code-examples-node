FROM --platform=linux/amd64 node:16-buster-slim

ARG UID=34251
ARG GID=34251
ARG USERNAME=ds
ARG GROUPNAME=ds
ARG USERSHELL=/bin/bash

RUN groupadd --system ${GROUPNAME} -g ${GID} && \
    useradd --create-home --shell ${USERSHELL} --system --no-log-init -g ${GROUPNAME} -u ${UID} ${USERNAME}

WORKDIR /home/${USERNAME}

COPY package.json package-lock.json ./
RUN npm install

COPY . .


RUN chown -R ${USERNAME}:${GROUPNAME} /home/${USERNAME}/
USER ${USERNAME}

EXPOSE 3000

CMD ["npm", "start"]