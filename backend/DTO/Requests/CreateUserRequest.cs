namespace SprintTracker.DTO.Requests
{
    public class CreateUserRequest
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
    }
}