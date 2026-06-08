namespace SprintTracker.Database.Models
{
    public class Sprint
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public SprintStatus Status { get; set; } = SprintStatus.Upcoming;
        public List<UserStory> UserStories { get; set; } = new List<UserStory>();
        public string JoinCode { get; set; }
        public List<SprintMember> SprintMembers { get; set; } = new List<SprintMember>();

        public Sprint()
        {
            JoinCode = GenerateJoinCode();
        }

        private static string GenerateJoinCode()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}