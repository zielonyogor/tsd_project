using System.ComponentModel.DataAnnotations;

using SprintTracker.Database.Models;

namespace SprintTracker.DTO.Requests
{
    public class UpdateSprintStatusRequest
    {
        [Required]
        public SprintStatus Status { get; set; }
    }
}