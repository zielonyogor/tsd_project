using System.Security.Cryptography;
using System.Text;

using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;
using SprintTracker.DTO.Responses;
namespace SprintTracker.Mapper
{
    public class UserMapper
    {
        public User MapToUser(RegisterUserRequest request)
        {
            return new User
            {
                Name = request.Name,
                PasswordHash = HashPassword(request.Password)
            };
        }

        public RegisterUserResponse MapToRegisterUserResponse(User user)
        {
            return new RegisterUserResponse
            {
                Id = user.Id,
                Name = user.Name
            };
        }

        public LoginUserResponse MapToLoginUserResponse(User user)
        {
            return new LoginUserResponse
            {
                Id = user.Id,
                Name = user.Name
            };
        }

        public bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput.Equals(hash);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}