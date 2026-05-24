using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SprintTracker.Controllers;
using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;
using SprintTracker.Mapper;

namespace SprintTracker.Tests.Controllers
{
    public class SprintUserControllerTests
    {
        [Fact]
        public void CreateUser_ShouldReturnCreatedAndPersistUser()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.RegisterUser(new CreateUserRequest
            {
                Name = "Developer",
                Password = "password123"
            });

            var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
            context.Users.Should().Contain(u => u.Name == "Developer");
            createdResult.RouteValues.Should().ContainKey("id");
        }

        [Fact]
        public void CreateUser_ShouldReturnBadRequest_WhenNameIsEmpty()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.RegisterUser(new CreateUserRequest
            {
                Name = " ",
                Password = "password123"
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void CreateUser_ShouldReturnBadRequest_WhenPasswordIsEmpty()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.RegisterUser(new CreateUserRequest
            {
                Name = "Developer",
                Password = " "
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void Login_ShouldReturnOkWithExistingUser_WhenUserExists()
        {
            using var context = GetDatabaseContext();
            SeedUsers(context);
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.Login(new CreateUserRequest
            {
                Name = "Alice",
                Password = "password123"
            });

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var user = okResult.Value.Should().BeAssignableTo<User>().Subject;
            user.Name.Should().Be("Alice");
            context.Users.Should().HaveCount(2);
        }

        [Fact]
        public void Login_ShouldCreateAndReturnNewUser_WhenUserDoesNotExist()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.Login(new CreateUserRequest
            {
                Name = "NewUser",
                Password = "password123"
            });

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var user = okResult.Value.Should().BeAssignableTo<User>().Subject;
            user.Name.Should().Be("NewUser");
            context.Users.Should().Contain(u => u.Name == "NewUser");
        }

        [Fact]
        public void Login_ShouldReturnBadRequest_WhenNameIsEmpty()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.Login(new CreateUserRequest
            {
                Name = "  ",
                Password = "password123"
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void JoinSprint_ShouldReturnOkAndAddSprintMember_WhenUserAndSprintExist()
        {
            using var context = GetDatabaseContext();
            SeedSprints(context);
            SeedUsers(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprint(1, new JoinSprintRequest
            {
                UserId = 1
            });

            result.Should().BeOfType<OkObjectResult>();
            context.SprintMembers.Should().Contain(sm => sm.SprintId == 1 && sm.UserId == 1);
        }

        [Fact]
        public void JoinSprint_ShouldReturnBadRequest_WhenUserDoesNotExist()
        {
            using var context = GetDatabaseContext();
            SeedSprints(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprint(1, new JoinSprintRequest
            {
                UserId = 99
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void JoinSprint_ShouldReturnNotFound_WhenSprintDoesNotExist()
        {
            using var context = GetDatabaseContext();
            SeedUsers(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprint(1, new JoinSprintRequest
            {
                UserId = 1
            });

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public void JoinSprint_ShouldReturnBadRequest_WhenUserIsAlreadyMember()
        {
            using var context = GetDatabaseContext();
            SeedSprints(context);
            SeedUsers(context);
            SeedSprintMembers(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprint(1, new JoinSprintRequest
            {
                UserId = 1
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void JoinSprintByCode_ShouldReturnOkAndAddSprintMember_WhenCodeIsValid()
        {
            using var context = GetDatabaseContext();
            var sprint = new Sprint { Id = 1, Name = "Sprint 1", JoinCode = "ABC123" };
            context.Sprints.Add(sprint);
            context.Users.Add(new User { Id = 1, Name = "Alice", PasswordHash = "hashedpassword" });
            context.SaveChanges();

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprintByCode(new JoinSprintByCodeRequest
            {
                JoinCode = "ABC123",
                UserId = 1
            });

            result.Should().BeOfType<OkObjectResult>();
            context.SprintMembers.Should().Contain(sm => sm.SprintId == 1 && sm.UserId == 1);
        }

        [Fact]
        public void JoinSprintByCode_ShouldReturnNotFound_WhenCodeDoesNotExist()
        {
            using var context = GetDatabaseContext();
            SeedUsers(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprintByCode(new JoinSprintByCodeRequest
            {
                JoinCode = "INVALID",
                UserId = 1
            });

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public void JoinSprintByCode_ShouldReturnBadRequest_WhenUserDoesNotExist()
        {
            using var context = GetDatabaseContext();
            var sprint = new Sprint { Id = 1, Name = "Sprint 1", JoinCode = "ABC123" };
            context.Sprints.Add(sprint);
            context.SaveChanges();

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprintByCode(new JoinSprintByCodeRequest
            {
                JoinCode = "ABC123",
                UserId = 99
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void JoinSprintByCode_ShouldReturnBadRequest_WhenUserIsAlreadyMember()
        {
            using var context = GetDatabaseContext();
            var sprint = new Sprint { Id = 1, Name = "Sprint 1", JoinCode = "ABC123" };
            context.Sprints.Add(sprint);
            context.Users.Add(new User { Id = 1, Name = "Alice", PasswordHash = "hashedpassword" });
            context.SprintMembers.Add(new SprintMember { Id = 1, SprintId = 1, UserId = 1 });
            context.SaveChanges();

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.JoinSprintByCode(new JoinSprintByCodeRequest
            {
                JoinCode = "ABC123",
                UserId = 1
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public void GetSprintMembers_ShouldReturnOk_WithMemberList()
        {
            using var context = GetDatabaseContext();
            SeedSprints(context);
            SeedUsers(context);
            SeedSprintMembers(context);

            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.GetSprintMembers(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var members = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            members.Should().HaveCount(1);
        }

        [Fact]
        public void GetSprintMembers_ShouldReturnNotFound_WhenSprintDoesNotExist()
        {
            using var context = GetDatabaseContext();
            var controller = new SprintUserController(context, new UserMapper());

            var result = controller.GetSprintMembers(99);

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        private void SeedSprints(AppDbContext context)
        {
            context.Sprints.Add(new Sprint { Id = 1, Name = "Sprint 1" });
            context.SaveChanges();
        }

        private void SeedUsers(AppDbContext context)
        {
            context.Users.Add(new User { Id = 1, Name = "Alice", PasswordHash = "hashedpassword" });
            context.Users.Add(new User { Id = 2, Name = "Bob", PasswordHash = "hashedpassword" });
            context.SaveChanges();
        }

        private void SeedSprintMembers(AppDbContext context)
        {
            context.SprintMembers.Add(new SprintMember { Id = 1, SprintId = 1, UserId = 1 });
            context.SaveChanges();
        }
    }
}