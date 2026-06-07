using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

using SprintTracker.Database.Data;
using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;
using SprintTracker.Hubs;
using SprintTracker.Mapper;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SprintController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SprintMapper _sprintMapper;
        private readonly IHubContext<SprintHub> _hub;

        public SprintController(AppDbContext context, SprintMapper sprintMapper, IHubContext<SprintHub> hub)
        {
            _context = context;
            _sprintMapper = sprintMapper;
            _hub = hub;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetSprintsForUser(int userId)
        {
            var sprintIds = _context.SprintMembers
                .Where(sm => sm.UserId == userId)
                .Select(sm => sm.SprintId)
                .ToList();

            var sprints = _context.Sprints
                .Where(s => sprintIds.Contains(s.Id))
                .ToList();

            return Ok(sprints);
        }

        [HttpGet("{id}/user/{userId}")]
        public IActionResult GetSprintForUser(int id, int userId)
        {
            var isMember = _context.SprintMembers.Any(sm => sm.SprintId == id && sm.UserId == userId);
            if (!isMember)
            {
                return NotFound();
            }

            var sprint = _context.Sprints.Find(id);
            if (sprint == null)
            {
                return NotFound();
            }

            return Ok(sprint);
        }

        [HttpPost]
        public IActionResult CreateSprint([FromBody] CreateSprintRequest request)
        {
            var creator = _context.Users.Find(request.CreatorUserId);
            if (creator == null)
            {
                return BadRequest("Creator user not found");
            }

            var sprint = _sprintMapper.MapToSprint(request);
            _context.Sprints.Add(sprint);
            _context.SaveChanges();

            _context.SprintMembers.Add(new SprintMember
            {
                SprintId = sprint.Id,
                UserId = request.CreatorUserId
            });
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetSprintForUser), new { id = sprint.Id, userId = request.CreatorUserId }, sprint);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSprint(int id, [FromBody] CreateSprintRequest request)
        {
            var sprint = _context.Sprints.Find(id);
            if (sprint == null)
            {
                return NotFound();
            }

            sprint.Name = request.Name;
            sprint.StartDate = request.StartDate;
            sprint.EndDate = request.EndDate;

            _context.SaveChanges();

            await _hub.Clients
                .Group(SprintHub.GroupName(sprint.Id))
                .SendAsync("sprintUpdated", sprint);

            return Ok(sprint);
        }
    }
}