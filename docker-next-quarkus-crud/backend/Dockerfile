# Stage 1: Build Quarkus fast-jar
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Lightweight JRE Runtime
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/quarkus-app/lib/ /app/lib/
COPY --from=builder /app/target/quarkus-app/*.jar /app/
COPY --from=builder /app/target/quarkus-app/app/ /app/app/
COPY --from=builder /app/target/quarkus-app/quarkus/ /app/quarkus/

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]

