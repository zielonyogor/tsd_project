namespace SprintTracker.Database.Models
{
    public class Sprint
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<UserStory> UserStories { get; set; } = new List<UserStory>();
    }
}