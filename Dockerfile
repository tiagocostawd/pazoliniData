# Usa uma imagem leve do Nginx baseada no Alpine Linux
FROM nginx:alpine

# Copia os arquivos essenciais do projeto para a pasta pública do Nginx
COPY index.html /usr/share/nginx/html/
COPY style.min.css /usr/share/nginx/html/
COPY script.min.js /usr/share/nginx/html/

# Copia nossa configuração customizada do Nginx para remover os bloqueios CSP do Coolify
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 do container
EXPOSE 80

# O Nginx já inicia automaticamente pelo comando padrão da imagem
