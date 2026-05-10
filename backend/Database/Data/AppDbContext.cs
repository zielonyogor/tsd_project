using Microsoft.EntityFrameworkCore;

using SprintTracker.Database.Models;

namespace SprintTracker.Database.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<UserStory> UserStories { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
    }
}