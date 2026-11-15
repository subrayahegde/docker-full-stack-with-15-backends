plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    id("io.ktor.plugin") version "3.6.1"
}

group = "com.example"
version = "0.0.1"

application {
    mainClass.set("com.example.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor Server Core & Plugins
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    implementation("io.ktor:ktor-server-cors-jvm")
    implementation("io.ktor:ktor-server-status-pages-jvm")
    implementation("io.ktor:ktor-server-call-logging-jvm")

    // Database: Exposed SQL + PostgreSQL + HikariCP
    implementation("org.jetbrains.exposed:exposed-core:1.6.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:1.6.1")
    implementation("org.jetbrains.exposed:exposed-java-time:1.6.1")
    implementation("org.postgresql:postgresql:42.7.5")
    implementation("com.zaxxer:HikariCP:6.2.1")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.5.16")
}

