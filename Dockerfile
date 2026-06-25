FROM node:18-alpine

# ساخت پوشه کاری
WORKDIR /app

# کپی package.json ها
COPY package*.json ./

# نصب dependency ها
RUN npm install

# کپی کل سورس
COPY . .

# پورت بک‌اند
EXPOSE 5000

# اجرای اپ
CMD ["npm", "run", "dev"]