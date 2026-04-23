FROM lscr.io/linuxserver/bambustudio:latest

# Create directories for uploads and outputs
RUN mkdir -p /config/uploads /config/output

# Set the working directory
WORKDIR /config

# Copy the slicing script (if needed)
COPY slice.sh /config/slice.sh
RUN chmod +x /config/slice.sh

# Expose necessary ports (if required)
EXPOSE 5001

# Start Bambu Studio
CMD ["/init"]
