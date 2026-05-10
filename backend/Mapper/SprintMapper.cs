using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;

namespace SprintTracker.Mapper
{
    public class SprintMapper
    {
        public Sprint MapToSprint(CreateSprintRequest request)
        {
            return new Sprint
            {
                Name = request.Name,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };
        }
    }
}