using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using SprintTracker.Controllers;
using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;
using SprintTracker.Mapper;

namespace SprintTracker.Tests.Controllers
{
    public class SprintControllerTests
    {

        [Fact]
        public void GetSprints_ShouldReturnOk_WithListOfSprints()
        {
            using var context = GetDatabaseContext();
            var mapperMock = new Mock<SprintMapper>();
            var controller = new SprintController(context, mapperMock.Object);

            var result = controller.GetSprints();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var sprints = okResult.Value.Should().BeAssignableTo<IEnumerable<Sprint>>().Subject;
            sprints.Should().HaveCountGreaterThan(0);
        }

        [Fact]
        public void CreateSprint_ShouldAddSprintToDatabase()
        {
            using var context = GetDatabaseContext();
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper);
            var request = new CreateSprintRequest
            {
                Name = "New Sprint",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14)
            };

            var result = controller.CreateSprint(request);

            result.Should().BeOfType<CreatedAtActionResult>();
            context.Sprints.Should().Contain(s => s.Name == "New Sprint");
        }

        [Fact]
        public void UpdateSprint_ShouldModifyExistingSprint()
        {
            using var context = GetDatabaseContext();
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper);
            var request = new CreateSprintRequest
            {
                Name = "Updated Sprint",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14)
            };

            var result = controller.UpdateSprint(1, request);

            result.Should().BeOfType<OkObjectResult>();
            context.Sprints.Find(1)!.Name.Should().Be("Updated Sprint");
        }

        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();
            SeedSprints(databaseContext);
            return databaseContext;
        }

        private void SeedSprints(AppDbContext context)
        {
            context.Sprints.Add(new Sprint { Id = 1, Name = "Sprint 1" });
            context.SaveChanges();
        }
    }
}