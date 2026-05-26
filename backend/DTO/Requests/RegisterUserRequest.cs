namespace SprintTracker.DTO.Requests
{
    public class RegisterUserRequest
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
    }
}