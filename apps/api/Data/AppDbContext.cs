using Microsoft.EntityFrameworkCore;

namespace WorkoutApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
}
