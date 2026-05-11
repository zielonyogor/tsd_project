namespace SprintTracker.DTO.Requests
{
    public class JoinSprintByCodeRequest
    {
        public string JoinCode { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}