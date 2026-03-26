using Microsoft.EntityFrameworkCore;

namespace SprintTracker.Data
{
    internal class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
    }
}