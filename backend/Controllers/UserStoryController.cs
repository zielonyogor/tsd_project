using System.Linq;

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
        public IActionResult CreateUserStory(CreateUserStoryRequest userStory)
        {
            var newUserStory = _mapper.MapToUserStory(userStory);

            _context.UserStories.Add(newUserStory);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetUserStories), null, newUserStory);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUserStory(int id, UpdateUserStoryRequest userStory)
        {
            var existingUserStory = _context.UserStories.Find(id);
            if (existingUserStory == null)
            {
                return NotFound();
            }

            _mapper.MapToUserStory(userStory, existingUserStory);
            _context.SaveChanges();
            return NoContent();
        }
    }
}