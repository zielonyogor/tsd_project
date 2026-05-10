using System.Linq;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SprintTracker.Database.Data;
using SprintTracker.DTO.Requests;
using SprintTracker.Mapper;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserStoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserStoryMapper _mapper;

        public UserStoryController(AppDbContext context, UserStoryMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [Authorize]
        [HttpGet]
        public IActionResult GetUserStories()
        {
            var userStories = _context.UserStories.ToList();
            return Ok(userStories);
        }

        [Authorize]
        [HttpGet("{sprintId}")]
        public IActionResult GetUserStoriesBySprint(int sprintId)
        {
            if (!TryGetSprintIdFromToken(out var authorizedSprintId) || authorizedSprintId != sprintId)
            {
                return Forbid();
            }

            var userStories = _context.UserStories.Where(us => us.SprintId == sprintId).ToList();
            return Ok(userStories);
        }

        [Authorize]
        [HttpPost]
        public IActionResult CreateUserStory(CreateUserStoryRequest userStory)
        {
            if (!TryGetSprintIdFromToken(out var authorizedSprintId))
            {
                return Forbid();
            }

            if (userStory.SprintId.HasValue && userStory.SprintId.Value != authorizedSprintId)
            {
                return Forbid();
            }

            userStory.SprintId = authorizedSprintId;
            var newUserStory = _mapper.MapToUserStory(userStory);

            _context.UserStories.Add(newUserStory);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetUserStories), null, newUserStory);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult UpdateUserStory(int id, UpdateUserStoryRequest userStory)
        {
            var existingUserStory = _context.UserStories.Find(id);
            if (existingUserStory == null)
            {
                return NotFound();
            }

            if (!TryGetSprintIdFromToken(out var authorizedSprintId) || existingUserStory.SprintId != authorizedSprintId)
            {
                return Forbid();
            }

            _mapper.MapToUserStory(userStory, existingUserStory);
            _context.SaveChanges();
            return NoContent();
        }

        private bool TryGetSprintIdFromToken(out int sprintId)
        {
            sprintId = default;

            var sprintClaim = User.FindFirstValue("sprint_id");
            return int.TryParse(sprintClaim, out sprintId);
        }
    }
}