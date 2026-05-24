using System.Security.Cryptography;
using System.Text;

using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;

namespace SprintTracker.Mapper
{
    public class UserMapper
    {
        public User MapToUser(CreateUserRequest request)
        {
            return new User
            {
                Name = request.Name,
                PasswordHash = HashPassword(request.Password)
            };
        }


        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        public bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput.Equals(hash);
        }
    }
}