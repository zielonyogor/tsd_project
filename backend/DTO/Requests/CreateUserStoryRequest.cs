using System.ComponentModel.DataAnnotations;

namespace SprintTracker.DTO.Requests
{
    public class CreateUserStoryRequest
    {
        [Required, MaxLength(100)]
        public required string Title { get; set; }
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Status { get; set; } = string.Empty;
        public int? SprintId { get; set; }
    }
}