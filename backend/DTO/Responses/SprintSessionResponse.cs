using SprintTracker.Database.Models;

namespace SprintTracker.DTO.Responses
{
    public class SprintSessionResponse
    {
        public Sprint Sprint { get; set; } = new Sprint { SessionCode = string.Empty, Name = string.Empty };
        public string AccessToken { get; set; } = string.Empty;
        public string JoinUrl { get; set; } = string.Empty;
    }
}