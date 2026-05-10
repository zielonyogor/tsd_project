using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.IdentityModel.Tokens;

using SprintTracker.Database.Models;

namespace SprintTracker.Services
{
    public class SessionTokenService
    {
        private readonly IConfiguration _configuration;

        public SessionTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(Sprint sprint)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "dev-session-key-change-before-production";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "SprintTracker";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "SprintTrackerClient";

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>
            {
                new("sprint_id", sprint.Id.ToString()),
                new("session_code", sprint.SessionCode),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}