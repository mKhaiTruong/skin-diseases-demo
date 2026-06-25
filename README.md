---
title: Skin Diseases Chatbot
emoji: 🩺
colorFrom: red
colorTo: yellow
sdk: docker
pinned: false
---

# skin-diseases-demo

docker run -p 7860:7860 --env-file .env -v $(pwd)/data_persist:/app/data_persist skin-disease-test