namespace SprintTracker.Database.Models
{
    public class UserStory
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public UserStoryStatus Status { get; set; } = UserStoryStatus.ToDo;
        public int? SprintId { get; set; }
        public Sprint? Sprint { get; set; }
    }
}