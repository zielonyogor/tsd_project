using System.ComponentModel.DataAnnotations;

namespace SprintTracker.DTO.Requests
{
    public class JoinSprintSessionRequest
    {
        [Required, MaxLength(16)]
        public required string SessionCode { get; set; }
    }
}