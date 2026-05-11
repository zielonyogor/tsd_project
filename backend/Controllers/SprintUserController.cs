using Microsoft.AspNetCore.Mvc;
using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SprintUserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SprintUserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("Sprint/{id}/join")]
        public IActionResult JoinSprint(int id, [FromBody] JoinSprintRequest request)
        {
            var sprint = _context.Sprints.Find(id);
            if (sprint == null)
            {
                return NotFound("Sprint not found");
            }

            var user = _context.Users.Find(request.UserId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var existingMember = _context.SprintMembers
                .FirstOrDefault(sm => sm.SprintId == id && sm.UserId == request.UserId);
            if (existingMember != null)
            {
                return BadRequest("User is already a member of this sprint");
            }

            var sprintMember = new SprintMember
            {
                UserId = request.UserId,
                SprintId = id
            };
            _context.SprintMembers.Add(sprintMember);
            _context.SaveChanges();

            return Ok(new { Message = "Joined sprint successfully", Sprint = sprint });
        }

        [HttpPost("Sprint/join")]
        public IActionResult JoinSprintByCode([FromBody] JoinSprintByCodeRequest request)
        {
            var sprint = _context.Sprints.FirstOrDefault(s => s.JoinCode == request.JoinCode);
            if (sprint == null)
            {
                return NotFound("Sprint not found");
            }

            var user = _context.Users.Find(request.UserId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var existingMember = _context.SprintMembers
                .FirstOrDefault(sm => sm.SprintId == sprint.Id && sm.UserId == request.UserId);
            if (existingMember != null)
            {
                return BadRequest("User is already a member of this sprint");
            }

            var sprintMember = new SprintMember
            {
                UserId = request.UserId,
                SprintId = sprint.Id
            };
            _context.SprintMembers.Add(sprintMember);
            _context.SaveChanges();

            return Ok(new { Message = "Joined sprint successfully", Sprint = sprint });
        }

        [HttpGet("Sprint/{id}/members")]
        public IActionResult GetSprintMembers(int id)
        {
            var sprint = _context.Sprints.Find(id);
            if (sprint == null)
            {
                return NotFound("Sprint not found");
            }

            var members = _context.SprintMembers
                .Where(sm => sm.SprintId == id)
                .Join(
                    _context.Users,
                    sm => sm.UserId,
                    u => u.Id,
                    (sm, u) => new
                    {
                        u.Id,
                        u.Name
                    })
                .ToList();

            return Ok(members);
        }

        [HttpPost("User")]
        public IActionResult CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("User name is required");
            }

            var user = new User
            {
                Name = request.Name.Trim()
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
        }
    }
}