ThisBuild / version      := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "3.3.4"

val Http4sVersion = "0.23.29"
val DoobieVersion = "1.0.0-RC5"
val CirceVersion  = "0.14.10"

lazy val root = (project in file("."))
  .settings(
    name := "scala-products-api",
    scalaVersion := "3.3.4",
    libraryDependencies ++= Seq(
      // Http4s (REST Server)
      "org.http4s" %% "http4s-ember-server" % Http4sVersion,
      "org.http4s" %% "http4s-dsl"          % Http4sVersion,
      "org.http4s" %% "http4s-circe"        % Http4sVersion,

      // Doobie (PostgreSQL Access)
      "org.tpolecat" %% "doobie-core"     % DoobieVersion,
      "org.tpolecat" %% "doobie-postgres" % DoobieVersion,
      "org.tpolecat" %% "doobie-hikari"   % DoobieVersion,

      // Circe (JSON Serialization)
      "io.circe" %% "circe-generic" % CirceVersion,

      // Logging
      "ch.qos.logback" % "logback-classic" % "1.5.12"
    )
  )

ThisBuild / assemblyMergeStrategy := {
  case PathList("META-INF", "services", xs @ _*) => MergeStrategy.concat
  case PathList("META-INF", xs @ _*)             => MergeStrategy.discard
  case "reference.conf"                          => MergeStrategy.concat
  case x                                         => MergeStrategy.first
}

