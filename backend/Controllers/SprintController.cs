using Microsoft.AspNetCore.Mvc;

using SprintTracker.Database.Data;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SprintController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SprintController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetSprints()
        {
            var sprints = _context.Sprints.ToList();
            return Ok(sprints);
        }
    }
}