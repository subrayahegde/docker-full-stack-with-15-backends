# Stage 1: Build the Scala application
FROM sbtscala/scala-sbt:eclipse-temurin-21_1.x AS builder

WORKDIR /app

# Cache dependencies first
COPY project/ ./project/
COPY build.sbt .
RUN sbt update

# Copy source code and build fat JAR
COPY src/ ./src/
RUN sbt assembly

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/scala-3.3.4/scala-products-api-assembly-0.1.0-SNAPSHOT.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]

