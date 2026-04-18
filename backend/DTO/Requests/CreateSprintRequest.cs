using System.ComponentModel.DataAnnotations;

namespace SprintTracker.DTO.Requests
{
    public class CreateSprintRequest
    {
        [Required, MaxLength(100)]
        public required string Title { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(1);
    }
}