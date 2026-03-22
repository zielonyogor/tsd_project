FROM node:24

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "ng", "serve", "--host=0.0.0.0", "--port", "3000", "--poll", "2000"]
