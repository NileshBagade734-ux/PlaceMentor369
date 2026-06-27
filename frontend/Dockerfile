FROM nginx:1.25-alpine
# Copy your local static files directly into Nginx
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]