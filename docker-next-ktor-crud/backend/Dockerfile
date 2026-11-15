# Stage 1: Build Fat JAR
FROM gradle:8.12-jdk21-alpine AS builder
WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN gradle buildFatJar --no-daemon

# Stage 2: Lightweight JRE Runtime
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/build/libs/*-all.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser
EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]

