using System.Linq;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

using SprintTracker.Database.Data;
using SprintTracker.DTO.Requests;
using SprintTracker.Hubs;
using SprintTracker.Mapper;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserStoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserStoryMapper _mapper;
        private readonly IHubContext<SprintHub> _hub;

        public UserStoryController(AppDbContext context, UserStoryMapper mapper, IHubContext<SprintHub> hub)
        {
            _context = context;
            _mapper = mapper;
            _hub = hub;
        }

        [HttpGet]
        public IActionResult GetUserStories()
        {
            var userStories = _context.UserStories.ToList();
            return Ok(userStories);
        }

        [HttpGet("{sprintId}")]
        public IActionResult GetUserStoriesBySprint(int sprintId)
        {
            var userStories = _context.UserStories.Where(us => us.SprintId == sprintId).ToList();
            return Ok(userStories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUserStory(CreateUserStoryRequest userStory)
        {
            var newUserStory = _mapper.MapToUserStory(userStory);

            _context.UserStories.Add(newUserStory);
            _context.SaveChanges();

            if (newUserStory.SprintId.HasValue)
            {
                await _hub.Clients
                    .Group(SprintHub.GroupName(newUserStory.SprintId.Value))
                    .SendAsync("userStoryCreated", newUserStory);
            }

            return CreatedAtAction(nameof(GetUserStories), null, newUserStory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserStory(int id, UpdateUserStoryRequest userStory)
        {
            var existingUserStory = _context.UserStories.Find(id);
            if (existingUserStory == null)
            {
                return NotFound();
            }

            _mapper.MapToUserStory(userStory, existingUserStory);
            _context.SaveChanges();

            if (existingUserStory.SprintId.HasValue)
            {
                await _hub.Clients
                    .Group(SprintHub.GroupName(existingUserStory.SprintId.Value))
                    .SendAsync("userStoryUpdated", existingUserStory);
            }

            return NoContent();
        }
    }
}