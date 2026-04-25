using Xunit;
using FluentAssertions;
using SprintTracker.Mapper;
using SprintTracker.DTO.Requests;
using SprintTracker.Database.Models;

namespace SprintTracker.Tests.Mapper
{
    public class UserStoryMapperTests
    {
        [Fact]
        public void MapToUserStory_ShouldHandleSpacesInStatus()
        {
            var mapper = new UserStoryMapper();
            var request = new CreateUserStoryRequest
            {
                Title = "Test Story",
                Status = "In Progress",
                Description = "Test Description"
            };
            var result = mapper.MapToUserStory(request);

            result.Status.Should().Be(UserStoryStatus.InProgress);
            result.Title.Should().Be("Test Story");
            result.Description.Should().Be("Test Description");
        }
    }
}