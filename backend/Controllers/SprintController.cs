using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

using SprintTracker.Database.Data;
using SprintTracker.DTO.Requests;
using SprintTracker.DTO.Responses;
using SprintTracker.Mapper;
using SprintTracker.Services;

namespace SprintTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SprintController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SprintMapper _sprintMapper;
        private readonly SessionTokenService _sessionTokenService;

        public SprintController(AppDbContext context, SprintMapper sprintMapper, SessionTokenService sessionTokenService)
        {
            _context = context;
            _sprintMapper = sprintMapper;
            _sessionTokenService = sessionTokenService;
        }

        [HttpGet]
        public IActionResult GetSprints()
        {
            if (!TryGetSprintIdFromToken(out var authorizedSprintId))
            {
                return Ok(Array.Empty<Database.Models.Sprint>());
            }

            var sprints = _context.Sprints
                .Where(sprint => sprint.Id == authorizedSprintId)
                .ToList();

            return Ok(sprints);
        }

        [HttpPost]
        public IActionResult CreateSprint([FromBody] CreateSprintRequest request)
        {
            var sprint = _sprintMapper.MapToSprint(request);
            sprint.SessionCode = GenerateUniqueSessionCode();
            _context.Sprints.Add(sprint);
            _context.SaveChanges();

            return Created(string.Empty, CreateSessionResponse(sprint));
        }

        [HttpPost("join")]
        public IActionResult JoinSprint([FromBody] JoinSprintSessionRequest request)
        {
            var sprint = _context.Sprints.FirstOrDefault(item => item.SessionCode == request.SessionCode);

            if (sprint == null)
            {
                return NotFound();
            }

            return Ok(CreateSessionResponse(sprint));
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult UpdateSprint(int id, [FromBody] CreateSprintRequest request)
        {
            var sprint = _context.Sprints.Find(id);
            if (sprint == null)
            {
                return NotFound();
            }

            if (!TryGetSprintIdFromToken(out var authorizedSprintId) || authorizedSprintId != id)
            {
                return Forbid();
            }

            sprint.Name = request.Name;
            sprint.StartDate = request.StartDate;
            sprint.EndDate = request.EndDate;

            _context.SaveChanges();
            return Ok(sprint);
        }

        private SprintSessionResponse CreateSessionResponse(Database.Models.Sprint sprint)
        {
            return new SprintSessionResponse
            {
                Sprint = sprint,
                AccessToken = _sessionTokenService.GenerateToken(sprint),
                JoinUrl = $"/board/{sprint.SessionCode}"
            };
        }

        private string GenerateUniqueSessionCode()
        {
            string sessionCode;

            do
            {
                sessionCode = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
            }
            while (_context.Sprints.Any(item => item.SessionCode == sessionCode));

            return sessionCode;
        }

        private bool TryGetSprintIdFromToken(out int sprintId)
        {
            sprintId = default;

            var sprintClaim = User.FindFirstValue("sprint_id");
            return int.TryParse(sprintClaim, out sprintId);
        }
    }
}