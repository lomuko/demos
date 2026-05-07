# 🤖 Spring Boot Chat AI + Ollama

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-2.0.0--M5-brightgreen)](https://spring.io/projects/spring-ai)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)](https://www.docker.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-white?logo=ai)](https://ollama.ai/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

A production-ready **REST API** for local AI chat powered by **Ollama** and **Spring AI**. Run your own private LLM without API keys or cloud dependencies.

---

## 🎯 Features

- ✅ **Local LLM** - Llama3 model running locally via Ollama
- ✅ **Real-time Streaming** - Server-Sent Events (SSE) for token-by-token responses
- ✅ **REST API** - Simple HTTP endpoints (blocking & streaming)
- ✅ **Docker Ready** - Complete containerization with Docker Compose
- ✅ **Spring Integration** - Built with Spring Boot 3.2.x & Spring AI
- ✅ **Private & Secure** - No external APIs, no data leaves your machine
- ✅ **Easy to Scale** - Simple to swap models or add features

---

## 📋 Prerequisites

- **Docker & Docker Compose** - For running Ollama
- **Java 17+** - For compiling and running the application
- **Gradle** - Build tool (included via Gradle Wrapper)

---

## 🚀 Quick Start

### 1. Clone & Navigate
```bash
cd chat-ai
```

### 2. Build the Application
```bash
./gradlew clean bootJar
```

### 3. Start Ollama Service
```bash
docker-compose up -d
```
**Note:** First run downloads the Llama3 model (~4GB). Monitor with:
```bash
docker logs -f ollama
```

### 4. Run the Spring Boot App
```bash
./gradlew bootRun
```

The API will be available at `http://localhost:8080`

---

## 📡 API Endpoints

### 1. Chat - Blocking Response
**Get a complete AI response (waits until finished)**

```http
GET /api/v1/chat?message=your+question+here
```

**Example:**
```bash
curl "http://localhost:8080/api/v1/chat?message=What%20is%20Docker"
```

**Response:**
```
Docker is a containerization platform that packages applications and their dependencies into isolated containers...
```

---

### 2. Chat - Streaming Response
**Get real-time token streaming via Server-Sent Events**

```http
GET /api/v1/chat/stream?message=your+question+here
```

**Example:**
```bash
curl -N "http://localhost:8080/api/v1/chat/stream?message=Explain%20Spring%20Boot%20in%202%20sentences"
```

**Response (streaming):**
```
Spring Boot is a framework that simplifies building production-ready Spring applications...
It provides auto-configuration and embedded servers for rapid development.
```

**JavaScript Client Example:**
```javascript
const eventSource = new EventSource('/api/v1/chat/stream?message=Hello');

eventSource.onmessage = (event) => {
  console.log('Token:', event.data);
};

eventSource.onerror = () => {
  console.error('Stream ended or error occurred');
  eventSource.close();
};
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│      Client (Browser/CLI)            │
└─────────────┬────────────────────────┘
              │ HTTP/REST
              ▼
┌──────────────────────────────────────┐
│    Spring Boot Application           │
│  ├─ ChatController                   │
│  ├─ OllamaChatModel (Spring AI)     │
│  └─ Rest Endpoints                   │
└─────────────┬────────────────────────┘
              │ HTTP
              ▼
┌──────────────────────────────────────┐
│  Ollama (Docker Container)           │
│  ├─ Llama3 Model                     │
│  ├─ Port: 11434                      │
│  └─ Local Inference Engine           │
└──────────────────────────────────────┘
```

---

## ⚙️ Configuration

Edit [src/main/resources/application.properties](src/main/resources/application.properties):

```properties
# Application name
spring.application.name=ai-chat-service

# Ollama configuration
spring.ai.ollama.base-url=http://ollama:11434
spring.ai.ollama.chat.model=llama3
```

**Change the LLM Model:**
```properties
# Available options (must be pulled in Ollama first):
# - llama3
# - mistral
# - neural-chat
# - orca-mini
# etc.
spring.ai.ollama.chat.model=mistral
```

---

## 📁 Project Structure

```
.
├── src/
│   ├── main/
│   │   ├── java/es/lomuko/chat_ai/
│   │   │   ├── ChatAiApplication.java    ← Main entry point
│   │   │   └── ChatController.java       ← REST API endpoints
│   │   └── resources/
│   │       └── application.properties    ← Configuration
│   └── test/
│       └── java/es/lomuko/chat_ai/
│           └── ChatAiApplicationTests.java
├── build.gradle                          ← Dependencies & build config
├── settings.gradle
├── docker-compose.yml                    ← Ollama service definition
├── Dockerfile                            ← Spring Boot container
├── HELP.md                               ← Original documentation
└── README.md                             ← This file
```

---

## 🛠️ Common Commands

### Build
```bash
# Clean build
./gradlew clean build

# Build JAR
./gradlew bootJar

# Compile only
./gradlew compileJava
```

### Run
```bash
# Run from Gradle
./gradlew bootRun

# Run JAR directly
java -jar build/libs/chat-ai-0.0.1-SNAPSHOT.jar

# Run with custom properties
java -jar build/libs/chat-ai-0.0.1-SNAPSHOT.jar \
  --spring.ai.ollama.chat.model=mistral
```

### Docker
```bash
# Start Ollama service
docker-compose up -d

# View logs
docker-compose logs -f ollama

# Stop services
docker-compose down

# Build custom Docker image
docker build -t chat-ai:latest .

# Run Spring Boot in container
docker run -p 8080:8080 --network chat-ai_default chat-ai:latest
```

### Testing
```bash
# Run all tests
./gradlew test

# Run single test class
./gradlew test --tests ChatAiApplicationTests
```

---

## 🔧 Troubleshooting

### Issue: "Connection refused" when calling API
**Solution:** Ensure Ollama is running:
```bash
docker-compose up -d
docker ps  # Should show ollama container
```

### Issue: Ollama container exits immediately
**Solution:** Check logs and ensure sufficient disk space (Llama3 needs ~4GB):
```bash
docker logs ollama
docker system df  # Check disk usage
```

### Issue: Slow response time
**Solution:** 
- Llama3 inference is CPU-intensive; consider using a smaller model (orca-mini)
- Ensure no other heavy processes are running
- Check Docker resource allocation (Docker Desktop settings)

### Issue: "Port 8080 already in use"
**Solution:** Kill the process or use a different port:
```bash
# Use different port
./gradlew bootRun --args='--server.port=8081'
```

---

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **API Framework** | Spring Boot | 3.2.x |
| **AI Integration** | Spring AI | 2.0.0-M5 |
| **LLM Engine** | Ollama | Latest |
| **LLM Model** | Llama3 | - |
| **Language** | Java | 17+ |
| **Build Tool** | Gradle | Latest |
| **Containerization** | Docker | Latest |
| **Reactive** | Project Reactor (Flux) | Latest |

---

## 📦 Dependencies

```gradle
// Main dependencies
implementation 'org.springframework.boot:spring-boot-starter-webmvc'
implementation 'org.springframework.ai:spring-ai-starter-model-ollama'

// Code generation
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'

// Testing
testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
```

---

## 🔐 Security Considerations

- **Local-Only**: Ollama runs locally; no data is sent externally
- **No Authentication**: Default setup has no auth (add Spring Security if needed)
- **Network Isolation**: Use Docker network for isolation in production
- **Model Validation**: Always validate user inputs before sending to LLM

---

## 🚀 Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
./gradlew bootRun
```

### Kubernetes (Production)
```bash
docker build -t chat-ai:1.0 .
docker tag chat-ai:1.0 myregistry/chat-ai:1.0
docker push myregistry/chat-ai:1.0
kubectl apply -f k8s-deployment.yaml
```

### JAR (Standalone)
```bash
./gradlew bootJar
java -jar build/libs/chat-ai-0.0.1-SNAPSHOT.jar
```

---

## 📝 Example Usage Scenarios

### 1. Simple Query
```bash
curl "http://localhost:8080/api/v1/chat?message=What%20is%20machine%20learning"
```

### 2. Streaming for UI
```javascript
fetch('/api/v1/chat/stream?message=Generate a poem about coding')
  .then(response => response.body.getReader())
  .then(reader => {
    const decoder = new TextDecoder();
    return reader.read().then(function process({done, value}) {
      if (done) return;
      console.log(decoder.decode(value));
      return reader.read().then(process);
    });
  });
```

### 3. Batch Processing
```bash
for question in "What is AI?" "Explain ML" "Define DL"
do
  curl "http://localhost:8080/api/v1/chat?message=$question"
done
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Spring AI](https://spring.io/projects/spring-ai) - AI integration framework
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Llama 3](https://www.meta.com/research/llama/) - Open source LLM model
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework

---

## 📧 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
3. Check [Ollama Documentation](https://github.com/ollama/ollama)

---

**Built with ❤️ using Spring Boot & Ollama**
