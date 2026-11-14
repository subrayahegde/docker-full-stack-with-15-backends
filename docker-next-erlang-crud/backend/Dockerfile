# Stage 1: Build the Erlang release
FROM erlang:27-alpine AS builder

WORKDIR /app

# Install git and build tools if needed for dependencies
RUN apk add --no-cache git build-base

# Cache dependencies first
COPY rebar.config rebar.lock* ./
RUN rebar3 compile

# Copy source code and build production release
COPY src ./src
RUN rebar3 release

# Stage 2: Minimal runtime image (matching Alpine version with OpenSSL 3.5+)
FROM alpine:3.22

# Install OpenSSL and ncurses required by the Erlang VM (ERTS)
RUN apk add --no-cache openssl ncurses-libs libstdc++

WORKDIR /app

# Copy the compiled release from the builder stage
COPY --from=builder /app/_build/default/rel/my_shop ./

EXPOSE 5000

# Run the release in the foreground
CMD ["/app/bin/my_shop", "foreground"]

