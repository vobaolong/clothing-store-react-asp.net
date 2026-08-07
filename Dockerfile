# ── Stage 1: Build frontend (Vite → static files) ─────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ── Stage 2: Publish backend ─────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /app
COPY backend/ ./
# Copy built frontend into API wwwroot (served by ASP.NET in production)
RUN mkdir -p src/ClothingStore.API/wwwroot
COPY --from=frontend-build /app/frontend/dist/ src/ClothingStore.API/wwwroot/
RUN dotnet publish src/ClothingStore.API/ClothingStore.API.csproj -c Release -o /app/publish

# ── Stage 3: Runtime ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish ./
EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "ClothingStore.API.dll"]
