FROM docker-slic3r-prusa3d:1.41.3

WORKDIR /slicer

USER root
RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list && \
    echo "deb http://archive.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list && \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until && \
    apt-get update && \
    apt-get install -y --allow-unauthenticated curl jq && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Copy service files
COPY package.json app.js config.ini /slicer/

RUN npm install

# Create temp directories
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

EXPOSE 8080

CMD ["node", "app.js"]