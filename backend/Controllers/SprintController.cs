using Microsoft.AspNetCore.Mvc;

using SprintTracker.Database.Data;
using SprintTracker.DTO.Requests;
using SprintTracker.Mapper;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SprintController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SprintMapper _sprintMapper;

        public SprintController(AppDbContext context, SprintMapper sprintMapper)
        {
            _context = context;
            _sprintMapper = sprintMapper;
        }

        [HttpGet]
        public IActionResult GetSprints()
        {
            var sprints = _context.Sprints.ToList();
            return Ok(sprints);
        }

        [HttpPost]
        public IActionResult CreateSprint([FromBody] CreateSprintRequest request)
        {
            var sprint = _sprintMapper.MapToSprint(request);
            _context.Sprints.Add(sprint);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetSprints), new { id = sprint.Id }, sprint);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateSprint(int id, [FromBody] CreateSprintRequest request)
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
            return Ok(sprint);
        }
    }
}