using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SprintTracker.Controllers;
using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;
using SprintTracker.Hubs;
using SprintTracker.Mapper;

namespace SprintTracker.Tests.Controllers
{
    public class SprintControllerTests
    {
        [Fact]
        public void GetSprintsForUser_ShouldReturnOk_WithSprintsForThatUser()
        {
            using var context = GetDatabaseContext();
            SeedSprintsWithMembers(context);
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());

            var result = controller.GetSprintsForUser(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var sprints = okResult.Value.Should().BeAssignableTo<IEnumerable<Sprint>>().Subject;
            sprints.Should().HaveCount(1);
            sprints.First().Name.Should().Be("Sprint 1");
        }

        [Fact]
        public void GetSprintForUser_ShouldReturnOk_WhenUserIsMember()
        {
            using var context = GetDatabaseContext();
            SeedSprintsWithMembers(context);
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());

            var result = controller.GetSprintForUser(1, 1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var sprint = okResult.Value.Should().BeAssignableTo<Sprint>().Subject;
            sprint.Id.Should().Be(1);
            sprint.Name.Should().Be("Sprint 1");
        }

        [Fact]
        public void GetSprintForUser_ShouldReturnNotFound_WhenUserIsNotMember()
        {
            using var context = GetDatabaseContext();
            SeedSprintsWithMembers(context);
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());

            var result = controller.GetSprintForUser(1, 2);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public void CreateSprint_ShouldAddSprintToDatabase_AndAutoJoinCreator()
        {
            using var context = GetDatabaseContext();
            SeedUsers(context);
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());
            var request = new CreateSprintRequest
            {
                Name = "New Sprint",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                CreatorUserId = 1
            };

            var result = controller.CreateSprint(request);

            result.Should().BeOfType<CreatedAtActionResult>();
            context.Sprints.Should().Contain(s => s.Name == "New Sprint");

            var newSprint = context.Sprints.First(s => s.Name == "New Sprint");
            context.SprintMembers.Should().Contain(sm => sm.SprintId == newSprint.Id && sm.UserId == 1);
        }

        [Fact]
        public void CreateSprint_ShouldReturnBadRequest_WhenCreatorUserDoesNotExist()
        {
            using var context = GetDatabaseContext();
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());
            var request = new CreateSprintRequest
            {
                Name = "New Sprint",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                CreatorUserId = 99
            };

            var result = controller.CreateSprint(request);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateSprint_ShouldModifyExistingSprint()
        {
            using var context = GetDatabaseContext();
            SeedSprints(context);
            var mapper = new SprintMapper();
            var controller = new SprintController(context, mapper, CreateHubContext());
            var request = new CreateSprintRequest
            {
                Name = "Updated Sprint",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                CreatorUserId = 1
            };

            var result = await controller.UpdateSprint(1, request);

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
            return databaseContext;
        }

        private void SeedSprints(AppDbContext context)
        {
            context.Sprints.Add(new Sprint { Id = 1, Name = "Sprint 1" });
            context.SaveChanges();
        }

        private void SeedUsers(AppDbContext context)
        {
            context.Users.Add(new User { Id = 1, Name = "Alice", PasswordHash = "hashedpassword" });
            context.SaveChanges();
        }

        private void SeedSprintsWithMembers(AppDbContext context)
        {
            context.Users.AddRange(
                new User { Id = 1, Name = "Alice", PasswordHash = "hashedpassword" },
                new User { Id = 2, Name = "Bob", PasswordHash = "hashedpassword" }
            );
            context.Sprints.Add(new Sprint { Id = 1, Name = "Sprint 1" });
            context.SprintMembers.Add(new SprintMember { Id = 1, SprintId = 1, UserId = 1 });
            context.SaveChanges();
        }

        private static IHubContext<SprintHub> CreateHubContext()
        {
            var clientProxy = new Mock<IClientProxy>();
            clientProxy
                .Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var clients = new Mock<IHubClients>();
            clients.Setup(c => c.Group(It.IsAny<string>())).Returns(clientProxy.Object);

            var hubContext = new Mock<IHubContext<SprintHub>>();
            hubContext.Setup(h => h.Clients).Returns(clients.Object);

            return hubContext.Object;
        }
    }
}
