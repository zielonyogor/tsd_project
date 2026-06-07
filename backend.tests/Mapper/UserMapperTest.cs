using FluentAssertions;
using SprintTracker.Mapper;
using SprintTracker.DTO.Requests;

namespace SprintTracker.Tests.Mapper
{
    public class UserMapperTest
    {
        private UserMapper _mapper;

        public UserMapperTest()
        {
            _mapper = new UserMapper();
        }

        [Fact]
        public void MapToUser_ShouldMapCreateUserRequestToUser()
        {
            var request = new RegisterUserRequest
            {
                Name = "TestUser",
                Password = "TestPassword"
            };

            var user = _mapper.MapToUser(request);

            user.Name.Should().Be(request.Name);
            user.PasswordHash.Should().NotBeNull();
            user.PasswordHash.Should().NotBe(request.Password);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrueForCorrectPassword()
        {
            var password = "TestPassword";
            var request = new RegisterUserRequest
            {
                Name = "TestUser",
                Password = password
            };
            var user = _mapper.MapToUser(request);

            var result = _mapper.VerifyPassword(password, user.PasswordHash);
            result.Should().BeTrue();
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalseForIncorrectPassword()
        {
            var request = new RegisterUserRequest
            {
                Name = "TestUser",
                Password = "CorrectPassword"
            };
            var user = _mapper.MapToUser(request);

            var result = _mapper.VerifyPassword("WrongPassword", user.PasswordHash);
            result.Should().BeFalse();
        }
    }
}