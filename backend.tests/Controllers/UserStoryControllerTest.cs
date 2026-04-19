using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using SprintTracker.Controllers;
using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.Mapper;

namespace SprintTracker.Tests.Controllers
{
    public class UserStoryControllerTest
    {
        [Fact]
        public void GetUserStories_ShouldReturnOk_WithListOfUserStories()
        {
            using var context = GetDatabaseContext();
            var mapperMock = new Mock<UserStoryMapper>();
            var controller = new UserStoryController(context, mapperMock.Object);

            var result = controller.GetUserStories();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var userStories = okResult.Value.Should().BeAssignableTo<IEnumerable<UserStory>>().Subject;
            userStories.Should().HaveCountGreaterThan(0);
        }

        [Fact]
        public void GetUserStoriesBySprint_ShouldReturnOk_WithFilteredUserStories()
        {
            using var context = GetDatabaseContext();
            var mapperMock = new Mock<UserStoryMapper>();
            var controller = new UserStoryController(context, mapperMock.Object);

            var result = controller.GetUserStoriesBySprint(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var userStories = okResult.Value.Should().BeAssignableTo<IEnumerable<UserStory>>().Subject;
            userStories.Should().HaveCount(1);
            var firstUserStory = userStories.First();
            firstUserStory.SprintId.Should().Be(1);
            firstUserStory.Title.Should().Be("User Story 2");
        }

        [Fact]
        public void CreateUserStory_ShouldAddUserStoryToDatabase()
        {
            using var context = GetDatabaseContext();
            var mapper = new UserStoryMapper();
            var controller = new UserStoryController(context, mapper);
            var request = new DTO.Requests.CreateUserStoryRequest { 
                Title = "New User Story", 
                Description = "Description of the user story", 
                SprintId = 1 
            };

            var result = controller.CreateUserStory(request);

            result.Should().BeOfType<CreatedAtActionResult>();
            context.UserStories.Should().Contain(us => us.Title == "New User Story");
        }

        [Fact]
        public void UpdateUserStory_ShouldModifyExistingUserStory()
        {
            using var context = GetDatabaseContext();
            var mapper = new UserStoryMapper();
            var controller = new UserStoryController(context, mapper);
            var request = new DTO.Requests.UpdateUserStoryRequest { 
                Title = "Updated User Story", 
                Description = "Updated description", 
                SprintId = 1 
            };

            var result = controller.UpdateUserStory(2, request);

            result.Should().BeOfType<NoContentResult>();
            var updatedUserStory = context.UserStories.Find(2);
            updatedUserStory.Should().NotBeNull();
            updatedUserStory!.Title.Should().Be("Updated User Story");
            updatedUserStory.Description.Should().Be("Updated description");
        }

        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();
            SeedUserStories(databaseContext);
            return databaseContext;
        }

        private void SeedUserStories(AppDbContext context)
        {
            context.UserStories.AddRange( 
                new UserStory { Id = 1, Title = "User Story 1" },
                new UserStory { Id = 2, Title = "User Story 2", SprintId = 1 }
            );
            context.SaveChanges();
        }
    }
}