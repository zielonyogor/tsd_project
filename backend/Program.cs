
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Data.Common;

using SprintTracker.Database.Data;
using SprintTracker.Mapper;
using SprintTracker.Services;

namespace SprintTracker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-session-key-change-before-production";
                    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SprintTracker";
                    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SprintTrackerClient";

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = jwtAudience,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                });
            builder.Services.AddAuthorization();
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddSingleton<UserStoryMapper>();
            builder.Services.AddSingleton<SprintMapper>();
            builder.Services.AddSingleton<SessionTokenService>();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Apply migrations automatically on startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
                EnsureSprintSessionSchema(db);
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseCors("Frontend");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }

        private static void EnsureSprintSessionSchema(AppDbContext db)
        {
            var connection = db.Database.GetDbConnection();
            var shouldCloseConnection = connection.State != System.Data.ConnectionState.Open;

            if (shouldCloseConnection)
            {
                db.Database.OpenConnection();
            }

            try
            {
                if (!SprintSessionColumnExists(connection))
                {
                    ExecuteNonQuery(connection, "ALTER TABLE \"Sprints\" ADD COLUMN \"SessionCode\" character varying(16);");
                }

                ExecuteNonQuery(
                    connection,
                    "UPDATE \"Sprints\" SET \"SessionCode\" = upper(substr(md5(random()::text || \"Id\"::text || clock_timestamp()::text), 1, 8)) WHERE \"SessionCode\" IS NULL OR \"SessionCode\" = '';");

                ExecuteNonQuery(connection, "ALTER TABLE \"Sprints\" ALTER COLUMN \"SessionCode\" SET NOT NULL;");
                ExecuteNonQuery(connection, "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Sprints_SessionCode\" ON \"Sprints\" (\"SessionCode\");");
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    db.Database.CloseConnection();
                }
            }
        }

        private static bool SprintSessionColumnExists(DbConnection connection)
        {
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Sprints' AND column_name = 'SessionCode');";
            var result = command.ExecuteScalar();
            return result is bool exists && exists;
        }

        private static void ExecuteNonQuery(DbConnection connection, string commandText)
        {
            using var command = connection.CreateCommand();
            command.CommandText = commandText;
            command.ExecuteNonQuery();
        }
    }
}