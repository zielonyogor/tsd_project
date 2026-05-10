FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

COPY backend/backend.csproj backend/
COPY backend.tests/backend.tests.csproj backend.tests/
RUN dotnet restore backend.tests/backend.tests.csproj

COPY backend/ backend/
COPY backend.tests/ backend.tests/

CMD ["dotnet", "test", "backend.tests/backend.tests.csproj", "--configuration", "Release", "--no-restore", "--verbosity", "normal"]