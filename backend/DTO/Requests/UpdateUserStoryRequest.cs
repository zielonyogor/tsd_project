namespace SprintTracker.DTO.Requests
{
    public class UpdateUserStoryRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? SprintId { get; set; }
    }
}